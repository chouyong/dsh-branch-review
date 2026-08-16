import type { SessionListState } from './contract.ts'
import { invertStatus, type ReviewRecord, type ReviewStatus } from './records.ts'
import { recordHealth } from './lineage.ts'

export type QueueFilter = 'all' | 'unresolved' | 'resolved' | 'follow-up' | 'orphaned'

export interface QueueCounts {
  readonly all: number
  readonly unresolved: number
  readonly resolved: number
  readonly followUp: number
  readonly orphaned: number
}

export function statusForPair(
  records: readonly ReviewRecord[],
  leftSessionId: string,
  rightSessionId: string,
): ReviewStatus | undefined {
  const record = recordForPair(records, leftSessionId, rightSessionId)
  if (record === undefined) return undefined
  return record.leftSessionId === leftSessionId ? record.status : invertStatus(record.status)
}

export function recordForPair(
  records: readonly ReviewRecord[],
  leftSessionId: string,
  rightSessionId: string,
): ReviewRecord | undefined {
  return records.find(record =>
    record.leftSessionId === leftSessionId && record.rightSessionId === rightSessionId
      || record.leftSessionId === rightSessionId && record.rightSessionId === leftSessionId)
}

export function matchesQueueFilter(
  record: ReviewRecord,
  state: Pick<SessionListState, 'byId'>,
  filter: QueueFilter,
): boolean {
  const health = recordHealth(state, record.leftSessionId, record.rightSessionId)
  if (filter === 'orphaned') return health !== 'active'
  if (filter === 'unresolved') return record.status === 'unresolved'
  if (filter === 'resolved') return record.status !== 'unresolved' && record.status !== 'follow-up'
  if (filter === 'follow-up') return record.status === 'follow-up'
  return true
}

export function sortQueue(
  records: readonly ReviewRecord[],
  state: Pick<SessionListState, 'byId'>,
  filter: QueueFilter,
  focusSessionId?: string,
): readonly ReviewRecord[] {
  return records
    .filter(record => focusSessionId === undefined || record.leftSessionId === focusSessionId || record.rightSessionId === focusSessionId)
    .filter(record => matchesQueueFilter(record, state, filter))
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt || left.recordId.localeCompare(right.recordId))
}

export function countQueue(
  records: readonly ReviewRecord[],
  state: Pick<SessionListState, 'byId'>,
  focusSessionId?: string,
): QueueCounts {
  const scoped = focusSessionId === undefined
    ? records
    : records.filter(record => record.leftSessionId === focusSessionId || record.rightSessionId === focusSessionId)
  const counts = { all: scoped.length, unresolved: 0, resolved: 0, followUp: 0, orphaned: 0 }
  for (const record of scoped) {
    if (matchesQueueFilter(record, state, 'unresolved')) counts.unresolved += 1
    if (matchesQueueFilter(record, state, 'resolved')) counts.resolved += 1
    if (matchesQueueFilter(record, state, 'follow-up')) counts.followUp += 1
    if (matchesQueueFilter(record, state, 'orphaned')) counts.orphaned += 1
  }
  return counts
}
