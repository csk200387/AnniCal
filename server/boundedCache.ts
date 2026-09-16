/** 값의 보관 비용과 항목 수를 함께 제한하는 인스턴스별 LRU 캐시. */
export class BoundedCache<T> {
  private entries = new Map<string, { value: T; bytes: number }>()
  private bytes = 0

  constructor(private maxEntries: number, private maxBytes: number) {}

  get size(): number { return this.entries.size }
  get retainedBytes(): number { return this.bytes }

  get(key: string): T | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, bytes: number): void {
    this.delete(key)
    if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > this.maxBytes) return
    if (this.maxEntries < 1) return
    while (this.entries.size >= this.maxEntries || this.bytes + bytes > this.maxBytes) {
      this.delete(this.entries.keys().next().value!)
    }
    this.entries.set(key, { value, bytes })
    this.bytes += bytes
  }

  private delete(key: string): void {
    const entry = this.entries.get(key)
    if (entry) this.bytes -= entry.bytes
    this.entries.delete(key)
  }
}
