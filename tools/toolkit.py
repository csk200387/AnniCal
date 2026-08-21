"""데이터 파일 쓰기 공통 유틸 — 원자적 교체·파일 잠금·정규 JSON 직렬화.

왜 필요한가: 기념일 데이터는 월별 12파일에 흩어져 있고, 한 번의 저장이 12파일을
모두 다시 쓴다. 중간에 예외가 나거나 프로세스가 죽으면 일부 파일만 새 상태가 되어
데이터셋이 조각난다(총 건수는 맞는데 어떤 항목은 두 번, 어떤 항목은 사라진 상태).

여기 있는 함수들은 다음을 보장한다.

- 같은 디렉터리의 임시 파일에 먼저 쓰고 fsync 한 뒤 os.replace 로 갈아끼운다.
  os.replace 는 같은 파일시스템 안에서 원자적이라, 읽는 쪽은 이전 내용이나 새 내용
  둘 중 하나만 본다 — 잘린 파일을 볼 일이 없다.
- 여러 파일을 함께 바꿀 때는 임시 파일을 전부 만든 뒤에야 교체를 시작하고,
  교체 도중 실패하면 이미 바꾼 것을 원래 내용으로 되돌린다.
- 잠금 파일로 같은 데이터셋을 동시에 쓰는 프로세스를 직렬화한다.

tools/inspector, tools/enrich, tools/observances 가 모두 이 모듈을 쓴다.
"""

from __future__ import annotations

import json
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

try:  # POSIX 전용. Windows 에서는 잠금 없이 동작한다(단독 실행 가정).
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None  # type: ignore[assignment]


def dumps(data: Any) -> str:
    """저장소 전체가 공유하는 정규 JSON 표기 — UTF-8 원문, 2-space, 끝에 개행."""
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


@contextmanager
def file_lock(target: Path) -> Iterator[None]:
    """`target` 옆에 `.lock` 파일을 만들어 배타 잠금을 잡는다.

    Gradio 검수기를 두 탭에서 열어 두거나, 검수기가 떠 있는 채로 CLI 도구를 돌리면
    두 프로세스가 같은 12파일을 동시에 덮어쓸 수 있다. 잠금은 그 둘을 줄 세운다.
    (프로세스 안에서 뒤늦게 저장된 stale snapshot 문제는 별도 — save_dataset 의
    기대 상태 검사가 담당한다.)
    """
    if fcntl is None:
        yield
        return
    lock_path = target if target.is_dir() else target.parent
    lock_file = lock_path / ".write.lock"
    lock_path.mkdir(parents=True, exist_ok=True)
    fd = os.open(lock_file, os.O_CREAT | os.O_RDWR, 0o644)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        yield
    finally:
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)


def _write_temp(path: Path, text: str) -> Path:
    """같은 디렉터리에 임시 파일로 내용을 쓰고 fsync 한 뒤 그 경로를 돌려준다."""
    tmp = path.with_name(f".{path.name}.tmp")
    fd = os.open(tmp, os.O_CREAT | os.O_WRONLY | os.O_TRUNC, 0o644)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
    except BaseException:
        tmp.unlink(missing_ok=True)
        raise
    return tmp


def _fsync_dir(directory: Path) -> None:
    """디렉터리 엔트리 변경(rename)을 디스크에 확정. 전원 차단 대비."""
    try:
        fd = os.open(directory, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(fd)
    except OSError:
        pass
    finally:
        os.close(fd)


def atomic_write_text(path: Path, text: str) -> None:
    """파일 하나를 원자적으로 교체한다."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = _write_temp(path, text)
    os.replace(tmp, path)
    _fsync_dir(path.parent)


def atomic_write_json(path: Path, data: Any) -> None:
    atomic_write_text(path, dumps(data))


def atomic_write_many(updates: dict[Path, str]) -> None:
    """여러 파일을 "전부 아니면 전무"에 가깝게 교체한다.

    1) 임시 파일을 **모두** 만든다 — 여기서 실패하면 원본은 하나도 안 건드린 상태다.
    2) 원본 내용을 기억해 둔 뒤 차례로 교체한다.
    3) 교체 도중 실패하면 이미 바꾼 파일을 기억해 둔 내용으로 되돌리고 예외를 올린다.

    POSIX 에 여러 rename 을 한 트랜잭션으로 묶는 수단은 없다. 실패 창(window)을
    "임시 파일 생성 전체"에서 "rename 몇 번" 으로 좁히고, 그마저도 되돌리는 것이
    표준 파일시스템에서 할 수 있는 최선이다.
    """
    if not updates:
        return

    temps: dict[Path, Path] = {}
    try:
        for path, text in updates.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            temps[path] = _write_temp(path, text)
    except BaseException:
        for tmp in temps.values():
            tmp.unlink(missing_ok=True)
        raise

    previous: dict[Path, bytes | None] = {}
    replaced: list[Path] = []
    try:
        for path, tmp in temps.items():
            previous[path] = path.read_bytes() if path.exists() else None
            os.replace(tmp, path)
            replaced.append(path)
    except BaseException:
        for path in replaced:  # 되돌리기 — 실패해도 원래 예외를 가리지 않는다.
            try:
                old = previous.get(path)
                if old is None:
                    path.unlink(missing_ok=True)
                else:
                    os.replace(_write_temp(path, old.decode("utf-8")), path)
            except OSError:
                pass
        for tmp in temps.values():
            tmp.unlink(missing_ok=True)
        raise

    for directory in {p.parent for p in temps}:
        _fsync_dir(directory)
