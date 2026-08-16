import type { SessionListState } from './contract.ts'
import type { ReviewRecord, ReviewStatus } from './records.ts'
import { recordHealth } from './lineage.ts'

export type QueueFilter = 'all' | 'unresolved' | 'resolved' | 'follow-up' | 'orphaned'

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
): readonly ReviewRecord[] {
  return records
    .filter(record => matchesQueueFilter(record, state, filter))
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt || left.recordId.localeCompare(right.recordId))
}

export function statusLabel(status: ReviewStatus): string {
  return status
}
