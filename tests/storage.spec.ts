import { describe, expect, it } from 'vitest'
import { createReviewRecord, serializeReviewRecords } from '../src/client/records.ts'
import { ReviewStore, STORAGE_KEY, type StorageLike } from '../src/client/storage.ts'

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>()
  fail = false

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.fail) throw new Error('quota')
    this.values.set(key, value)
  }
}

describe('review storage', () => {
  it('keeps corrupted data fail-closed and recovers on a later valid write', () => {
    const storage = new MemoryStorage()
    storage.values.set(STORAGE_KEY, '{broken')
    const store = new ReviewStore(storage)
    expect(store.snapshot.records).toEqual([])
    expect(store.snapshot.error).toBe('invalid-json')
    store.ensureRecord('left', 'right', 10)
    expect(store.snapshot.records).toHaveLength(1)
    expect(store.snapshot.error).toBeUndefined()
  })

  it('keeps the prior snapshot when storage quota fails', () => {
    const storage = new MemoryStorage()
    const store = new ReviewStore(storage)
    const first = store.ensureRecord('left', 'right', 10)
    storage.fail = true
    store.update(first.recordId, { status: 'keep-left' }, 20)
    expect(store.snapshot.records[0]?.status).toBe('unresolved')
    expect(store.snapshot.error).toBe('write-failed')
  })

  it('rejects imported cross-lineage records when the caller supplies eligibility', () => {
    const store = new ReviewStore(new MemoryStorage())
    const record = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'other', now: 1, recordId: 'r1' })
    expect(store.importJson(serializeReviewRecords([record]), () => false)).toBe(false)
    expect(store.snapshot.records).toEqual([])
    expect(store.snapshot.error).toBe('ineligible-record')
  })

  it('does not overwrite an intact oversized snapshot after load failure', () => {
    const storage = new MemoryStorage()
    const oversized = JSON.stringify({ schemaVersion: 1, records: [], padding: 'x'.repeat(520_000) })
    storage.values.set(STORAGE_KEY, oversized)
    const store = new ReviewStore(storage)
    store.ensureRecord('left', 'right', 10)
    expect(storage.values.get(STORAGE_KEY)).toBe(oversized)
    expect(store.snapshot.error).toBe('payload-too-large')
  })
})
