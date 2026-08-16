import {
  createReviewRecord,
  mergeReviewRecords,
  pairKey,
  parseReviewRecords,
  serializedByteLength,
  serializeReviewRecords,
  updateReviewRecord,
  type ReviewPatch,
  type ReviewRecord,
  MAX_SERIALIZED_BYTES,
} from './records.ts'

export const STORAGE_KEY = 'dsh-branch-review.records.v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface ReviewStoreSnapshot {
  readonly records: readonly ReviewRecord[]
  readonly error: string | undefined
}

export function browserStorage(): StorageLike | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

export class ReviewStore {
  private current: ReviewStoreSnapshot = { records: [], error: undefined }
  private readonly listeners = new Set<() => void>()
  private readonly storage: StorageLike | undefined
  private readonly storageListener: ((event: StorageEvent) => void) | undefined
  private writesBlocked = false

  constructor(storage: StorageLike | undefined = browserStorage()) {
    this.storage = storage
    this.load()
    if (typeof window !== 'undefined') {
      this.storageListener = (event) => {
        if (event.storageArea !== null && event.storageArea !== (this.storage as StorageLike | undefined)) return
        if (event.key === null) {
          this.current = { records: [], error: undefined }
          this.writesBlocked = false
          this.emit()
          return
        }
        if (event.key !== STORAGE_KEY) return
        if (event.newValue === null) {
          this.current = { records: [], error: undefined }
          this.writesBlocked = false
          this.emit()
          return
        }
        const parsed = parseReviewRecords(event.newValue)
        if (!parsed.ok) {
          this.writesBlocked = true
          this.setError(parsed.error)
          return
        }
        this.current = { records: parsed.records, error: undefined }
        this.emit()
      }
      window.addEventListener('storage', this.storageListener)
    }
  }

  get snapshot(): ReviewStoreSnapshot {
    return this.current
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  ensureRecord(leftSessionId: string, rightSessionId: string, now: number): ReviewRecord | undefined {
    const existing = this.current.records.find(record => pairKey(record.leftSessionId, record.rightSessionId) === pairKey(leftSessionId, rightSessionId))
    if (existing !== undefined) return existing
    const record = createReviewRecord({ leftSessionId, rightSessionId, now })
    if (!this.write(mergeReviewRecords(this.current.records, [record]))) return undefined
    return this.current.records.find(value => value.recordId === record.recordId)
  }

  update(recordId: string, patch: ReviewPatch, now: number): ReviewRecord | undefined {
    const existing = this.current.records.find(record => record.recordId === recordId)
    if (existing === undefined) return undefined
    const updated = updateReviewRecord(existing, patch, now)
    return this.write(this.current.records.map(record => record.recordId === recordId ? updated : record)) ? updated : existing
  }

  importJson(raw: string, isAllowed?: (record: ReviewRecord) => boolean): boolean {
    const parsed = parseReviewRecords(raw)
    if (!parsed.ok) {
      this.setError(parsed.error)
      return false
    }
    if (isAllowed !== undefined && parsed.records.some(record => !isAllowed(record))) {
      this.setError('ineligible-record')
      return false
    }
    return this.write(mergeReviewRecords(this.current.records, parsed.records), true)
  }

  exportJson(): string {
    return serializeReviewRecords(this.current.records)
  }

  dispose(): void {
    if (typeof window !== 'undefined' && this.storageListener !== undefined) window.removeEventListener('storage', this.storageListener)
    this.listeners.clear()
  }

  private load(): void {
    if (this.storage === undefined) return
    let raw: string | null
    try {
      raw = this.storage.getItem(STORAGE_KEY)
    } catch {
      this.setError('read-failed')
      return
    }
    if (raw === null) return
    const parsed = parseReviewRecords(raw)
    if (parsed.ok) this.current = { records: parsed.records, error: undefined }
    else {
      this.writesBlocked = true
      this.setError(parsed.error)
    }
  }

  private write(records: readonly ReviewRecord[], allowBlocked = false): boolean {
    if (this.writesBlocked && !allowBlocked) {
      return false
    }
    const normalized = [...records]
    const serialized = serializeReviewRecords(normalized)
    if (serializedByteLength(serialized) > MAX_SERIALIZED_BYTES) {
      this.writesBlocked = true
      this.setError('payload-too-large')
      return false
    }
    if (this.storage !== undefined) {
      try {
        this.storage.setItem(STORAGE_KEY, serialized)
      } catch {
        this.setError('write-failed')
        return false
      }
    }
    this.writesBlocked = false
    this.current = { records: normalized, error: undefined }
    this.emit()
    return true
  }

  private setError(error: string): void {
    this.current = { records: this.current.records, error }
    this.emit()
  }

  private emit(): void {
    for (const listener of [...this.listeners]) listener()
  }
}
