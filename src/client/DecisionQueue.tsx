import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { SessionId, SessionListState } from './contract.ts'
import { findRelatedSessions, isRelatedPair, recordHealth } from './lineage.ts'
import { REVIEW_STATUSES, type ReviewStatus } from './records.ts'
import { countQueue, sortQueue, statusForPair, type QueueFilter } from './queue.ts'
import { ReviewStore } from './storage.ts'
import { CSS_PREFIX } from './styles-prefix.ts'

type SessionListSelector = <T>(selector: (state: SessionListState) => T) => T

export interface DecisionQueueProps {
  readonly sessionId: string
  readonly useSessionList: SessionListSelector
  readonly open: (id: SessionId) => void
  readonly store: ReviewStore
  readonly t: (key: 'trigger' | 'title' | 'candidate' | 'status' | 'reason' | 'tags' | 'links' | 'save' | 'open' | 'export' | 'import' | 'all' | 'unresolved' | 'resolved' | 'followUp' | 'orphaned' | 'noCandidate' | 'noRecord' | 'noQueue' | 'degraded' | 'invalidImport' | 'storageError' | 'summary' | 'summaryAll' | 'summaryUnresolved' | 'summaryResolved' | 'summaryFollowUp' | 'summaryOrphaned' | 'unresolvedStatus' | 'keepLeft' | 'keepRight' | 'keepBoth' | 'discardBoth' | 'followUpStatus') => string
}

type StatusMessageKey = 'unresolvedStatus' | 'keepLeft' | 'keepRight' | 'keepBoth' | 'discardBoth' | 'followUpStatus'

const STATUS_LABELS: Record<ReviewStatus, StatusMessageKey> = {
  unresolved: 'unresolvedStatus',
  'keep-left': 'keepLeft',
  'keep-right': 'keepRight',
  'keep-both': 'keepBoth',
  'discard-both': 'discardBoth',
  'follow-up': 'followUpStatus',
}

const FILTERS: readonly QueueFilter[] = ['all', 'unresolved', 'resolved', 'follow-up', 'orphaned']

function now(): number {
  return Date.now()
}

function useStoreSnapshot(store: ReviewStore) {
  return useSyncExternalStore(store.subscribe.bind(store), () => store.snapshot, () => store.snapshot)
}

export function DecisionQueue({ sessionId, useSessionList, open, store, t }: DecisionQueueProps) {
  const ids = useSessionList(state => state.ids)
  const byId = useSessionList(state => state.byId)
  const current = useSessionList(state => state.current)
  const listState = useMemo(() => ({ ids, byId, current }), [ids, byId, current])
  const candidates = useMemo(() => findRelatedSessions(listState, sessionId as SessionId), [listState, sessionId])
  const snapshot = useStoreSnapshot(store)
  const currentRecords = useMemo(
    () => snapshot.records.filter(record => record.leftSessionId === sessionId || record.rightSessionId === sessionId),
    [sessionId, snapshot.records],
  )
  const [openPanel, setOpenPanel] = useState(false)
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [selectedRightId, setSelectedRightId] = useState<string | undefined>(undefined)
  const [reason, setReason] = useState('')
  const [tags, setTags] = useState('')
  const [links, setLinks] = useState('')
  const [notice, setNotice] = useState<string | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const selectedCandidate = candidates.find(candidate => candidate.id === selectedRightId) ?? candidates[0]
  const selectedRecord = selectedCandidate === undefined
    ? undefined
    : snapshot.records.find(record => record.leftSessionId === sessionId && record.rightSessionId === selectedCandidate.id)
  const visibleRecords = sortQueue(snapshot.records, listState, filter)
  const counts = countQueue(snapshot.records, listState)
  const hasTrigger = candidates.length > 0 || currentRecords.length > 0

  useEffect(() => {
    if (selectedCandidate !== undefined && selectedRightId !== selectedCandidate.id) setSelectedRightId(selectedCandidate.id)
  }, [selectedCandidate, selectedRightId])

  useEffect(() => {
    if (!openPanel || selectedCandidate === undefined) return
    store.ensureRecord(sessionId, selectedCandidate.id, now())
  }, [openPanel, selectedCandidate, sessionId, store])

  useEffect(() => {
    setReason(selectedRecord?.reason ?? '')
    setTags(selectedRecord?.tags.join(', ') ?? '')
    setLinks(selectedRecord?.externalLinks.join('\n') ?? '')
  }, [selectedRecord])

  useEffect(() => {
    if (!openPanel) return
    const closeOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpenPanel(false)
    }
    const closeEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpenPanel(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [openPanel])

  useEffect(() => {
    if (openPanel) return
    queueMicrotask(() => { triggerRef.current?.focus() })
  }, [openPanel])

  if (!hasTrigger) return null

  const selectedHealth = selectedRecord === undefined ? undefined : recordHealth(listState, selectedRecord.leftSessionId, selectedRecord.rightSessionId)
  const currentTitle = byId[sessionId]?.displayTitle ?? sessionId

  const saveDraft = (): void => {
    if (selectedRecord === undefined) return
    store.update(selectedRecord.recordId, {
      reason,
      tags: tags.split(',').map(value => value.trim()).filter(Boolean),
      externalLinks: links.split(/\r?\n/).map(value => value.trim()).filter(Boolean),
    }, now())
    setNotice(t('save'))
  }

  const updateStatus = (status: ReviewStatus): void => {
    if (selectedRecord !== undefined) store.update(selectedRecord.recordId, { status }, now())
  }

  const exportRecords = (): void => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dsh-branch-review.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importRecords = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    const accepted = store.importJson(await file.text(), record => {
      const left = byId[record.leftSessionId]
      const right = byId[record.rightSessionId]
      if (left === undefined || right === undefined) return true
      return isRelatedPair(listState, left.id, right.id)
    })
    setNotice(accepted ? t('save') : t('invalidImport'))
  }

  return (
    <div className={CSS_PREFIX} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${CSS_PREFIX}__trigger`}
        aria-haspopup="dialog"
        aria-expanded={openPanel}
        onClick={() => { setOpenPanel(value => !value); setNotice(undefined) }}
      >
        {t('trigger')}
      </button>
      {openPanel ? (
        <section className={`${CSS_PREFIX}__panel`} role="dialog" aria-label={t('title')}>
          <div className={`${CSS_PREFIX}__heading`}>
            <h2 className={`${CSS_PREFIX}__title`}>{t('title')}</h2>
            <button type="button" className={`${CSS_PREFIX}__close`} aria-label="Close" onClick={() => { setOpenPanel(false) }}>×</button>
          </div>
          <div className={`${CSS_PREFIX}__filters`}>
            <label className={`${CSS_PREFIX}__label`}>
              {t('candidate')}
              <select className={`${CSS_PREFIX}__select`} value={selectedRightId ?? ''} onChange={event => { setSelectedRightId(event.target.value) }}>
                {candidates.map(candidate => {
                  const candidateStatus = statusForPair(snapshot.records, sessionId, candidate.id)
                  return <option key={candidate.id} value={candidate.id}>{candidate.title} · {candidate.relation}{candidateStatus === undefined ? '' : ` · ${candidateStatus}`}</option>
                })}
              </select>
            </label>
            <label className={`${CSS_PREFIX}__label`}>
              Queue
              <select className={`${CSS_PREFIX}__select`} value={filter} onChange={event => { setFilter(event.target.value as QueueFilter) }}>
                {FILTERS.map(value => <option key={value} value={value}>{value === 'follow-up' ? t('followUp') : t(value)}</option>)}
              </select>
            </label>
          </div>
          <div className={`${CSS_PREFIX}__summary`} aria-label={t('summary')}>
            <span>{t('summaryAll')}: {counts.all}</span>
            <span>{t('summaryUnresolved')}: {counts.unresolved}</span>
            <span>{t('summaryResolved')}: {counts.resolved}</span>
            <span>{t('summaryFollowUp')}: {counts.followUp}</span>
            <span>{t('summaryOrphaned')}: {counts.orphaned}</span>
          </div>
          <div className={`${CSS_PREFIX}__queue`} aria-label="Review records">
            {visibleRecords.length === 0 ? <div className={`${CSS_PREFIX}__empty`}>{t('noQueue')}</div> : visibleRecords.map(record => {
              const otherId = record.leftSessionId === sessionId ? record.rightSessionId : record.leftSessionId
              const title = byId[otherId]?.displayTitle ?? otherId
              const selected = otherId === selectedRightId
              return (
                <button key={record.recordId} type="button" className={`${CSS_PREFIX}__queue-item${selected ? ` ${CSS_PREFIX}__queue-item--selected` : ''}`} onClick={() => { setSelectedRightId(otherId) }}>
                  <span className={`${CSS_PREFIX}__queue-name`}>{title}</span>
                  <span className={`${CSS_PREFIX}__queue-meta`}>{record.status} · {recordHealth(listState, record.leftSessionId, record.rightSessionId)}</span>
                </button>
              )
            })}
          </div>
          {selectedCandidate === undefined ? <div className={`${CSS_PREFIX}__empty`}>{t('noCandidate')}</div> : (
            <div className={`${CSS_PREFIX}__editor`}>
              <div className={`${CSS_PREFIX}__queue-meta`}>{currentTitle} → {selectedCandidate.title}{selectedHealth === 'orphaned' ? ` · ${t('orphaned')}` : ''}</div>
              {selectedHealth === 'orphaned' ? <div className={`${CSS_PREFIX}__notice`}>{t('degraded')}</div> : null}
              {selectedRecord === undefined ? <div className={`${CSS_PREFIX}__empty`}>{t('noRecord')}</div> : (
                <>
                  <label className={`${CSS_PREFIX}__label`}>{t('status')}<span className={`${CSS_PREFIX}__statuses`}>{REVIEW_STATUSES.map(status => <button key={status} type="button" className={`${CSS_PREFIX}__status${selectedRecord.status === status ? ` ${CSS_PREFIX}__status--active` : ''}`} aria-pressed={selectedRecord.status === status} onClick={() => { updateStatus(status) }}>{t(STATUS_LABELS[status])}</button>)}</span></label>
                  <label className={`${CSS_PREFIX}__label`}>{t('reason')}<textarea className={`${CSS_PREFIX}__input ${CSS_PREFIX}__textarea`} value={reason} onChange={event => { setReason(event.target.value) }} /></label>
                  <label className={`${CSS_PREFIX}__label`}>{t('tags')}<input className={`${CSS_PREFIX}__input`} value={tags} onChange={event => { setTags(event.target.value) }} /></label>
                  <label className={`${CSS_PREFIX}__label`}>{t('links')}<textarea className={`${CSS_PREFIX}__input ${CSS_PREFIX}__textarea`} value={links} onChange={event => { setLinks(event.target.value) }} /></label>
                  <div className={`${CSS_PREFIX}__actions`}>
                    <button type="button" className={`${CSS_PREFIX}__button ${CSS_PREFIX}__button--primary`} onClick={saveDraft}>{t('save')}</button>
                    <button type="button" className={`${CSS_PREFIX}__button`} onClick={() => { open(selectedCandidate.id) }}>{t('open')}</button>
                    <button type="button" className={`${CSS_PREFIX}__button`} onClick={exportRecords}>{t('export')}</button>
                    <button type="button" className={`${CSS_PREFIX}__button`} onClick={() => { importRef.current?.click() }}>{t('import')}</button>
                    <input ref={importRef} type="file" accept="application/json" hidden onChange={event => { void importRecords(event.target.files?.[0]); event.currentTarget.value = '' }} />
                  </div>
                </>
              )}
            </div>
          )}
          {snapshot.error !== undefined ? <div className={`${CSS_PREFIX}__notice`}>{t('storageError')} ({snapshot.error})</div> : null}
          {notice !== undefined ? <div className={`${CSS_PREFIX}__notice`} role="status">{notice}</div> : null}
        </section>
      ) : null}
    </div>
  )
}
