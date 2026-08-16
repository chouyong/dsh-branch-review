import { describe, expect, it } from 'vitest'
import { SessionId, type SessionListState } from '../src/client/contract.ts'
import { findRelatedSessions, isRelatedPair, recordHealth } from '../src/client/lineage.ts'

function state(): SessionListState {
  const parent = SessionId('parent')
  const left = SessionId('left')
  const right = SessionId('right')
  const child = SessionId('child')
  return {
    ids: [parent, left, right, child],
    byId: {
      parent: { id: parent, displayTitle: 'Parent', running: false, blank: false, updatedAt: 1 },
      left: { id: left, displayTitle: 'Left', parentId: parent, running: false, blank: false, updatedAt: 2 },
      right: { id: right, displayTitle: 'Right', parentId: parent, running: false, blank: false, updatedAt: 3 },
      child: { id: child, displayTitle: 'Child', parentId: left, running: false, blank: false, updatedAt: 4 },
    },
    current: left,
  }
}

describe('lineage eligibility', () => {
  it('returns only true sibling, parent, and child branches in host order', () => {
    const value = state()
    expect(findRelatedSessions(value, SessionId('left')).map(candidate => [candidate.id, candidate.relation])).toEqual([
      ['right', 'sibling'], ['parent', 'parent'], ['child', 'child'],
    ])
    expect(isRelatedPair(value, SessionId('left'), SessionId('right'))).toBe(true)
    expect(isRelatedPair(value, SessionId('left'), SessionId('parent'))).toBe(true)
  })

  it('rejects blank and subagent sessions and exposes orphaned records', () => {
    const value = state()
    const left = value.byId.left
    if (left === undefined) throw new Error('fixture missing left')
    const blankState: SessionListState = {
      ...value,
      byId: { ...value.byId, left: { ...left, blank: true } },
    }
    expect(findRelatedSessions(blankState, SessionId('left'))).toEqual([])
    expect(recordHealth(value, 'left', 'missing')).toBe('orphaned')
    expect(recordHealth(value, 'left', 'left')).toBe('degraded')
  })
})
