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
  it('keeps corrupted data fail-closed until explicit valid import', () => {
    const storage = new MemoryStorage()
    storage.values.set(STORAGE_KEY, '{broken')
    const store = new ReviewStore(storage)
    expect(store.snapshot.records).toEqual([])
    expect(store.snapshot.error).toBe('invalid-json')
    store.ensureRecord('left', 'right', 10)
    expect(storage.values.get(STORAGE_KEY)).toBe('{broken')
    const record = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 10, recordId: 'recovered' })
    expect(store.importJson(serializeReviewRecords([record]))).toBe(true)
    expect(store.snapshot.records).toHaveLength(1)
    expect(store.snapshot.error).toBeUndefined()
  })

  it('reuses a record when ensureRecord is called in reverse orientation', () => {
    const store = new ReviewStore(new MemoryStorage())
    const first = store.ensureRecord('left', 'right', 10)
    const reverse = store.ensureRecord('right', 'left', 20)
    expect(reverse?.recordId).toBe(first?.recordId)
    expect(store.snapshot.records).toHaveLength(1)
  })

  it('keeps the prior snapshot when storage quota fails', () => {
    const storage = new MemoryStorage()
    const store = new ReviewStore(storage)
    const first = store.ensureRecord('left', 'right', 10)
    expect(first).toBeDefined()
    if (first === undefined) return
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
