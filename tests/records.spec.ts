import { describe, expect, it } from 'vitest'
import {
  createReviewRecord,
  mergeReviewRecords,
  parseReviewRecords,
  serializeReviewRecords,
  updateReviewRecord,
} from '../src/client/records.ts'

describe('review records', () => {
  it('creates, updates, serializes, and parses a versioned record', () => {
    const record = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 10, recordId: 'r1' })
    const updated = updateReviewRecord(record, { status: 'keep-left', reason: 'Ship the smaller branch', tags: ['ship', 'ship'], externalLinks: ['https://github.com/example/1'] }, 20)
    const parsed = parseReviewRecords(serializeReviewRecords([updated]))
    expect(parsed).toEqual({ ok: true, records: [updated] })
  })

  it('migrates schema zero and deduplicates pairs by latest update', () => {
    const raw = JSON.stringify({ schemaVersion: 0, records: [
      { id: 'old', left: 'left', right: 'right', decision: 'keep-both', createdAt: 1, updatedAt: 2 },
    ] })
    const migrated = parseReviewRecords(raw)
    expect(migrated.ok).toBe(true)
    if (!migrated.ok) return
    const newer = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 5, recordId: 'new' })
    expect(mergeReviewRecords(migrated.records, [newer])).toHaveLength(1)
    expect(mergeReviewRecords(migrated.records, [newer])[0]?.recordId).toBe('new')
  })

  it('rejects invalid and future envelopes without erasing data', () => {
    expect(parseReviewRecords('{')).toEqual({ ok: false, error: 'invalid-json' })
    expect(parseReviewRecords(JSON.stringify({ schemaVersion: 9, records: [] }))).toEqual({ ok: false, error: 'unsupported-schema' })
    expect(parseReviewRecords(JSON.stringify({ schemaVersion: 1, records: [{ schemaVersion: 1 }] }))).toEqual({ ok: false, error: 'invalid-record' })
  })
})
