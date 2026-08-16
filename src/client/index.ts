import type { Context } from '@deepseek-ai/cordis'
import { DecisionQueue } from './DecisionQueue.tsx'
import type { SessionId, SessionsFace, SlotsFace } from './contract.ts'
import { createTranslate } from './locales.ts'
import { ReviewStore } from './storage.ts'
import { installStyles } from './styles.ts'

export const name = 'dsh-branch-review'
export const inject = ['sessions', 'slots']

export function apply(ctx: Context): void {
  const sessions = ctx.get('sessions') as SessionsFace
  const slots = ctx.get('slots') as SlotsFace
  const store = new ReviewStore()
  const t = createTranslate()

  ctx.effect(() => () => { store.dispose() }, 'dsh-branch-review: review store')
  ctx.effect(() => installStyles(), 'dsh-branch-review: stylesheet')

  slots.inject('conversation.session.header.actions', () => slots.register({
    name: 'conversation.session.header.actions',
    id: 'branch-review',
    order: 17,
    registrant: name,
    inject: (sessionId: string) => ({
      sessionId,
      hooks: { sessionList: sessions.list },
      open: (id: SessionId) => { sessions.open(id) },
      store,
      t,
    }),
  }, DecisionQueue))
}

export type { DecisionQueueProps } from './DecisionQueue.tsx'
export type { CandidateRelation, ReviewCandidate } from './lineage.ts'
export type { QueueFilter } from './queue.ts'
export type { QueueCounts } from './queue.ts'
export { MAX_SERIALIZED_BYTES } from './records.ts'
export type { ReviewPatch, ReviewRecord, ReviewStatus } from './records.ts'
export { findRelatedSessions, isRelatedPair, recordHealth } from './lineage.ts'
export { matchesQueueFilter, sortQueue } from './queue.ts'
export { countQueue, recordForPair, statusForPair } from './queue.ts'
export {
  createReviewRecord,
  mergeReviewRecords,
  parseReviewRecords,
  serializeReviewRecords,
  updateReviewRecord,
  validateReviewRecord,
} from './records.ts'
