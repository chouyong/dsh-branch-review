export const REVIEW_SCHEMA_VERSION = 1 as const

export const REVIEW_STATUSES = [
  'unresolved',
  'keep-left',
  'keep-right',
  'keep-both',
  'discard-both',
  'follow-up',
] as const

export type ReviewStatus = typeof REVIEW_STATUSES[number]

export interface ReviewRecord {
  readonly schemaVersion: typeof REVIEW_SCHEMA_VERSION
  readonly recordId: string
  readonly leftSessionId: string
  readonly rightSessionId: string
  readonly status: ReviewStatus
  readonly reason: string
  readonly tags: readonly string[]
  readonly externalLinks: readonly string[]
  readonly createdAt: number
  readonly updatedAt: number
}

export interface ReviewRecordInput {
  readonly leftSessionId: string
  readonly rightSessionId: string
  readonly now: number
  readonly recordId?: string
}

export type ReviewPatch = Partial<Pick<ReviewRecord, 'status' | 'reason' | 'tags' | 'externalLinks'>>

export type ParseRecordsError = 'invalid-json' | 'invalid-envelope' | 'unsupported-schema' | 'invalid-record'

export type ParseRecordsResult =
  | { readonly ok: true; readonly records: readonly ReviewRecord[] }
  | { readonly ok: false; readonly error: ParseRecordsError }

let fallbackId = 0

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function cleanText(value: string, limit: number): string {
  return value.trim().slice(0, limit)
}

function cleanTags(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return []
  const tags: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const tag = cleanText(item, 32)
    if (tag !== '' && !tags.includes(tag)) tags.push(tag)
    if (tags.length >= 12) break
  }
  return tags
}

function cleanLinks(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return []
  const links: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const link = cleanText(item, 500)
    try {
      const parsed = new URL(link)
      if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && !links.includes(link)) links.push(link)
    } catch {
      continue
    }
    if (links.length >= 12) break
  }
  return links
}

function isStatus(value: unknown): value is ReviewStatus {
  return typeof value === 'string' && (REVIEW_STATUSES as readonly string[]).includes(value)
}

export function validateReviewRecord(value: unknown): ReviewRecord | undefined {
  if (!isRecord(value) || value.schemaVersion !== REVIEW_SCHEMA_VERSION) return undefined
  const recordId = stringValue(value.recordId)
  const leftSessionId = stringValue(value.leftSessionId)
  const rightSessionId = stringValue(value.rightSessionId)
  const status = value.status
  const createdAt = numberValue(value.createdAt)
  const updatedAt = numberValue(value.updatedAt)
  if (recordId === undefined || recordId === '' || leftSessionId === undefined || leftSessionId === ''
    || rightSessionId === undefined || rightSessionId === '' || leftSessionId === rightSessionId
    || !isStatus(status) || createdAt === undefined || updatedAt === undefined
    || updatedAt < createdAt) return undefined
  return {
    schemaVersion: REVIEW_SCHEMA_VERSION,
    recordId: cleanText(recordId, 120),
    leftSessionId: cleanText(leftSessionId, 200),
    rightSessionId: cleanText(rightSessionId, 200),
    status,
    reason: cleanText(stringValue(value.reason) ?? '', 500),
    tags: cleanTags(value.tags),
    externalLinks: cleanLinks(value.externalLinks),
    createdAt,
    updatedAt,
  }
}

function migrateLegacy(value: unknown): ReviewRecord | undefined {
  if (!isRecord(value) || value.schemaVersion !== undefined && value.schemaVersion !== 0) return undefined
  const decision = stringValue(value.decision)
  const status: ReviewStatus = isStatus(decision) ? decision : 'unresolved'
  const now = numberValue(value.updatedAt) ?? numberValue(value.createdAt) ?? 0
  return validateReviewRecord({
    schemaVersion: REVIEW_SCHEMA_VERSION,
    recordId: stringValue(value.recordId) ?? stringValue(value.id),
    leftSessionId: stringValue(value.leftSessionId) ?? stringValue(value.left),
    rightSessionId: stringValue(value.rightSessionId) ?? stringValue(value.right),
    status,
    reason: stringValue(value.reason) ?? '',
    tags: value.tags ?? value.labels,
    externalLinks: value.externalLinks ?? value.links,
    createdAt: numberValue(value.createdAt) ?? now,
    updatedAt: now,
  })
}

function deduplicate(records: readonly ReviewRecord[]): readonly ReviewRecord[] {
  const byPair = new Map<string, ReviewRecord>()
  for (const record of records) {
    const key = `${record.leftSessionId}\u0000${record.rightSessionId}`
    const current = byPair.get(key)
    if (current === undefined || record.updatedAt > current.updatedAt
      || record.updatedAt === current.updatedAt && record.recordId < current.recordId) byPair.set(key, record)
  }
  return [...byPair.values()].sort((left, right) => right.updatedAt - left.updatedAt || left.recordId.localeCompare(right.recordId))
}

export function createReviewRecord(input: ReviewRecordInput): ReviewRecord {
  const recordId = input.recordId ?? globalThis.crypto?.randomUUID?.() ?? `review-${input.now}-${fallbackId++}`
  return {
    schemaVersion: REVIEW_SCHEMA_VERSION,
    recordId,
    leftSessionId: input.leftSessionId,
    rightSessionId: input.rightSessionId,
    status: 'unresolved',
    reason: '',
    tags: [],
    externalLinks: [],
    createdAt: input.now,
    updatedAt: input.now,
  }
}

export function updateReviewRecord(record: ReviewRecord, patch: ReviewPatch, now: number): ReviewRecord {
  const nextStatus = patch.status === undefined || !isStatus(patch.status) ? record.status : patch.status
  return {
    ...record,
    status: nextStatus,
    reason: patch.reason === undefined ? record.reason : cleanText(patch.reason, 500),
    tags: patch.tags === undefined ? record.tags : cleanTags(patch.tags),
    externalLinks: patch.externalLinks === undefined ? record.externalLinks : cleanLinks(patch.externalLinks),
    updatedAt: Math.max(now, record.createdAt),
  }
}

export function serializeReviewRecords(records: readonly ReviewRecord[]): string {
  return JSON.stringify({ schemaVersion: REVIEW_SCHEMA_VERSION, records: deduplicate(records) })
}

export function parseReviewRecords(raw: string): ParseRecordsResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'invalid-json' }
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.records) || typeof parsed.schemaVersion !== 'number') {
    return { ok: false, error: 'invalid-envelope' }
  }
  if (parsed.schemaVersion !== REVIEW_SCHEMA_VERSION && parsed.schemaVersion !== 0) {
    return { ok: false, error: 'unsupported-schema' }
  }
  const records: ReviewRecord[] = []
  for (const value of parsed.records) {
    const record = parsed.schemaVersion === 0 ? migrateLegacy(value) : validateReviewRecord(value)
    if (record === undefined) return { ok: false, error: 'invalid-record' }
    records.push(record)
  }
  return { ok: true, records: deduplicate(records) }
}

export function mergeReviewRecords(
  current: readonly ReviewRecord[],
  incoming: readonly ReviewRecord[],
): readonly ReviewRecord[] {
  return deduplicate([...current, ...incoming])
}

export function pairKey(leftSessionId: string, rightSessionId: string): string {
  return `${leftSessionId}\u0000${rightSessionId}`
}
