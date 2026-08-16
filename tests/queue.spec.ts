import { describe, expect, it } from 'vitest'
import { SessionId, type SessionListState } from '../src/client/contract.ts'
import { createReviewRecord } from '../src/client/records.ts'
import { countQueue, matchesQueueFilter, sortQueue, statusForPair } from '../src/client/queue.ts'

const list: SessionListState = {
  ids: [SessionId('left'), SessionId('right')],
  byId: {
    left: { id: SessionId('left'), displayTitle: 'Left', running: false, blank: false, updatedAt: 1 },
    right: { id: SessionId('right'), displayTitle: 'Right', running: false, blank: false, updatedAt: 1 },
  },
  current: SessionId('left'),
}

describe('review queue', () => {
  it('filters status groups and sorts newest first', () => {
    const unresolved = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 1, recordId: 'a' })
    const resolved = { ...createReviewRecord({ leftSessionId: 'left', rightSessionId: 'other', now: 2, recordId: 'b' }), status: 'keep-left' as const, updatedAt: 4 }
    expect(matchesQueueFilter(unresolved, list, 'unresolved')).toBe(true)
    expect(matchesQueueFilter(resolved, list, 'resolved')).toBe(true)
    expect(sortQueue([unresolved, resolved], list, 'all').map(record => record.recordId)).toEqual(['b', 'a'])
    expect(matchesQueueFilter(resolved, list, 'orphaned')).toBe(true)
  })

  it('counts decision and health buckets without changing record order', () => {
    const unresolved = createReviewRecord({ leftSessionId: 'left', rightSessionId: 'right', now: 1, recordId: 'a' })
    const resolved = { ...createReviewRecord({ leftSessionId: 'left', rightSessionId: 'other', now: 2, recordId: 'b' }), status: 'keep-left' as const }
    const followUp = { ...createReviewRecord({ leftSessionId: 'left', rightSessionId: 'missing', now: 3, recordId: 'c' }), status: 'follow-up' as const }
    expect(countQueue([unresolved, resolved, followUp], list)).toEqual({
      all: 3,
      unresolved: 1,
      resolved: 1,
      followUp: 1,
      orphaned: 2,
    })
  })

  it('finds a decision regardless of pair orientation', () => {
    const record = { ...createReviewRecord({ leftSessionId: 'right', rightSessionId: 'left', now: 1, recordId: 'r' }), status: 'keep-right' as const }
    expect(statusForPair([record], 'left', 'right')).toBe('keep-right')
    expect(statusForPair([], 'left', 'right')).toBeUndefined()
  })
})
