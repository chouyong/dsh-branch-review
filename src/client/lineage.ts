import type { SessionId, SessionListState, SessionSummary } from './contract.ts'

export type CandidateRelation = 'sibling' | 'parent' | 'child'

export interface ReviewCandidate {
  readonly id: SessionId
  readonly title: string
  readonly relation: CandidateRelation
  readonly running: boolean
}

function eligible(summary: SessionSummary | undefined, currentId: SessionId): summary is SessionSummary {
  return summary !== undefined && summary.id !== currentId && summary.origin !== 'subagent' && !summary.blank
}

export function findRelatedSessions(
  state: Pick<SessionListState, 'ids' | 'byId'>,
  currentId: SessionId,
): readonly ReviewCandidate[] {
  const current = state.byId[currentId]
  if (current === undefined || current.origin === 'subagent' || current.blank) return []
  const candidates: Array<{ readonly summary: SessionSummary; readonly relation: CandidateRelation }> = []
  const seen = new Set<string>()
  const add = (summary: SessionSummary | undefined, relation: CandidateRelation): void => {
    if (!eligible(summary, currentId) || seen.has(summary.id)) return
    seen.add(summary.id)
    candidates.push({ summary, relation })
  }
  if (current.parentId !== undefined) {
    for (const id of state.ids) {
      const summary = state.byId[id]
      if (summary?.parentId === current.parentId) add(summary, 'sibling')
    }
    add(state.byId[current.parentId], 'parent')
  }
  for (const id of state.ids) {
    const summary = state.byId[id]
    if (summary?.parentId === currentId) add(summary, 'child')
  }
  return candidates.map(({ summary, relation }) => ({
    id: summary.id,
    title: summary.displayTitle,
    relation,
    running: summary.running,
  }))
}

export function isRelatedPair(
  state: Pick<SessionListState, 'ids' | 'byId'>,
  leftSessionId: SessionId,
  rightSessionId: SessionId,
): boolean {
  return findRelatedSessions(state, leftSessionId).some(candidate => candidate.id === rightSessionId)
}

export function recordHealth(
  state: Pick<SessionListState, 'byId'>,
  leftSessionId: string,
  rightSessionId: string,
): 'active' | 'orphaned' | 'degraded' {
  if (leftSessionId === rightSessionId) return 'degraded'
  return state.byId[leftSessionId] === undefined || state.byId[rightSessionId] === undefined ? 'orphaned' : 'active'
}
