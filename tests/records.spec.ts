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
    const whitespace = { ...createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 1, recordId: 'r' }), recordId: '  ' }
    expect(parseReviewRecords(serializeReviewRecords([whitespace]))).toEqual({ ok: false, error: 'invalid-record' })
  })

  it('rejects oversized serialized payloads before parsing', () => {
    const raw = JSON.stringify({ schemaVersion: 1, records: [], padding: 'x'.repeat(520_000) })
    expect(parseReviewRecords(raw)).toEqual({ ok: false, error: 'payload-too-large' })
  })

  it('deduplicates a pair regardless of orientation and keeps timestamps monotonic', () => {
    const left = createReviewRecord({ leftSessionId: 'a', rightSessionId: 'b', now: 1, recordId: 'left' })
    const right = { ...createReviewRecord({ leftSessionId: 'b', rightSessionId: 'a', now: 2, recordId: 'right' }), status: 'keep-right' as const }
    expect(mergeReviewRecords([left], [right])).toHaveLength(1)
    expect(updateReviewRecord(right, { reason: 'later' }, 0).updatedAt).toBe(2)
  })

  it('normalizes identifiers when creating records', () => {
    const record = createReviewRecord({ leftSessionId: ' left ', rightSessionId: ' right ', recordId: ' id ', now: 1 })
    expect(record.leftSessionId).toBe('left')
    expect(record.rightSessionId).toBe('right')
    expect(record.recordId).toBe('id')
  })
})
