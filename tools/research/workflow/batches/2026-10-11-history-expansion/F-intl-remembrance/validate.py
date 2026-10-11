#!/usr/bin/env python3
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
inp = json.load(open(os.path.join(HERE, "input.json")))
d = json.load(open(os.path.join(HERE, "drafts.json")))
ids = [e["id"] for e in inp]
ok = True
assert set(ids) == set(d), (set(ids) ^ set(d))
norm = lambda s: re.sub(r"\s+", " ", s).strip()
for e in inp:
    i = e["id"]; r = d[i]
    for k in ("origin", "anecdote"):
        t = r[k]
        if re.search(r"[\x00-\x1f\x7f]", t) or "</script" in t.lower():
            print("CTRL/script", i, k); ok = False
    o, a = len(r["origin"]), len(r["anecdote"])
    flag = "" if (430 <= o <= 570 and 380 <= a <= 520) else "  <-- out of target"
    print(f"{i}: origin={o} anecdote={a} total={o+a} (was {e['current_chars']}){flag}")
    assert r["sourceUrl"].startswith("https://")
    for ev in r["evidence"]:
        p = os.path.join(HERE, ev["local_evidence_path"])
        body = open(p, encoding="utf-8").read()
        q = ev["quote_original"]
        if q in body:
            continue
        if norm(q) in norm(body):
            print("  (ws-normalized match)", ev["local_evidence_path"], q[:50]); continue
        print("  QUOTE NOT FOUND", i, ev["local_evidence_path"], q[:80]); ok = False
print("ALL OK" if ok else "FAILURES")
sys.exit(0 if ok else 1)
