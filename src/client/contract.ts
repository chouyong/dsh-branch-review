import type { Branded } from '@deepseek-ai/dsh-brand'
import type { HostObservable, SlotCore } from '@deepseek-ai/dsh-client-ui-slots'

export type SessionId = Branded<'SessionId'>

export function SessionId(id: string): SessionId {
  return id as SessionId
}

export interface SessionSummary {
  readonly id: SessionId
  readonly displayTitle: string
  readonly title?: string
  readonly parentId?: SessionId
  readonly origin?: 'subagent'
  readonly running: boolean
  readonly blank: boolean
  readonly updatedAt: number
}

export interface SessionListState {
  readonly ids: readonly SessionId[]
  readonly byId: Readonly<Record<string, SessionSummary>>
  readonly current: SessionId | undefined
}

export interface SessionsFace {
  readonly list: HostObservable<SessionListState>
  open(id: SessionId): void
}

export interface SlotsFace {
  readonly register: SlotCore['register']
  inject(
    key: 'conversation.session.header.actions',
    callback: () => () => void,
  ): () => void
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'conversation.session.header.actions': {
      kind: 'list'
      scope: 'session'
      owner: ConversationHeaderActionOwnerProps
    }
  }
}

export interface ConversationHeaderActionOwnerProps {}
