const MESSAGES = {
  trigger: 'Branch review',
  title: 'Branch review queue',
  candidate: 'Related branch',
  status: 'Decision',
  reason: 'Why',
  tags: 'Tags',
  links: 'Issue / PR links',
  save: 'Save decision',
  open: 'Open session',
  export: 'Export metadata',
  import: 'Import metadata',
  all: 'All',
  unresolved: 'Unresolved',
  resolved: 'Resolved',
  followUp: 'Follow-up',
  orphaned: 'Orphaned',
  summary: 'Queue summary',
  summaryAll: 'All',
  summaryUnresolved: 'Unresolved',
  summaryResolved: 'Resolved',
  summaryFollowUp: 'Follow-up',
  summaryOrphaned: 'Orphaned',
  noCandidate: 'No related branch is available.',
  noRecord: 'Select a related branch to create a review record.',
  noQueue: 'No records match this filter.',
  degraded: 'This record is missing a session and remains for recovery.',
  invalidImport: 'Import rejected. Check the version and record fields.',
  storageError: 'Local storage failed. Your current in-memory changes remain visible.',
  unresolvedStatus: 'Unresolved',
  keepLeft: 'Keep left',
  keepRight: 'Keep right',
  keepBoth: 'Keep both',
  discardBoth: 'Discard both',
  followUpStatus: 'Follow up',
} as const

export type MessageKey = keyof typeof MESSAGES

export function createTranslate(): (key: MessageKey) => string {
  return key => MESSAGES[key]
}
