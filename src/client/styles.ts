import { CSS_PREFIX } from './styles-prefix.ts'

const STYLE_ID = 'dsh-branch-review-style'
const HOLDERS_ATTRIBUTE = 'dshBranchReviewHolders'

const STYLESHEET = `
.${CSS_PREFIX} { display: inline-flex; position: relative; align-items: center; }
.${CSS_PREFIX}__trigger, .${CSS_PREFIX}__close, .${CSS_PREFIX}__button, .${CSS_PREFIX}__status { border: 0; font: inherit; cursor: pointer; }
.${CSS_PREFIX}__trigger { min-height: 28px; padding: 3px 8px; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary, #5c6370); font-size: 13px; }
.${CSS_PREFIX}__trigger:hover, .${CSS_PREFIX}__button:hover, .${CSS_PREFIX}__status:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.12)); }
.${CSS_PREFIX}__trigger:focus-visible, .${CSS_PREFIX}__close:focus-visible, .${CSS_PREFIX}__button:focus-visible, .${CSS_PREFIX}__status:focus-visible, .${CSS_PREFIX}__select:focus-visible, .${CSS_PREFIX}__input:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4d6bfe); outline-offset: 2px; }
.${CSS_PREFIX}__panel { position: fixed; top: 56px; right: 12px; z-index: 50; width: min(520px, calc(100vw - 24px)); max-height: min(700px, calc(100vh - 60px)); overflow: auto; padding: 14px; border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.24)); border-radius: 10px; background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #1f2329); box-shadow: 0 14px 34px rgba(0,0,0,.2); }
.${CSS_PREFIX}__heading { display: flex; align-items: center; gap: 8px; }
.${CSS_PREFIX}__title { flex: 1; margin: 0; font-size: 15px; }
.${CSS_PREFIX}__close { width: 28px; height: 28px; border-radius: 6px; background: transparent; }
.${CSS_PREFIX}__filters { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; margin: 12px 0; }
.${CSS_PREFIX}__select, .${CSS_PREFIX}__input { min-height: 32px; min-width: 0; padding: 5px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); border-radius: 6px; background: var(--dsw-alias-bg-layer-1, #fff); color: inherit; font: inherit; }
.${CSS_PREFIX}__summary { display: flex; flex-wrap: wrap; gap: 5px 9px; margin: 0 0 10px; color: var(--dsw-alias-label-tertiary, #8b919b); font-size: 11px; }
.${CSS_PREFIX}__queue { display: grid; gap: 6px; margin-bottom: 12px; }
.${CSS_PREFIX}__queue-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding: 7px 8px; border: 1px solid var(--dsw-alias-border-l3, rgba(127,127,127,.16)); border-radius: 6px; background: transparent; text-align: left; }
.${CSS_PREFIX}__queue-item--selected { border-color: var(--dsw-alias-state-business-primary, #4d6bfe); }
.${CSS_PREFIX}__queue-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${CSS_PREFIX}__queue-meta { color: var(--dsw-alias-label-tertiary, #8b919b); font-size: 11px; }
.${CSS_PREFIX}__editor { display: grid; gap: 8px; padding-top: 10px; border-top: 1px solid var(--dsw-alias-border-l3, rgba(127,127,127,.16)); }
.${CSS_PREFIX}__label { display: grid; gap: 4px; color: var(--dsw-alias-label-secondary, #5c6370); font-size: 11px; }
.${CSS_PREFIX}__textarea { min-height: 64px; resize: vertical; }
.${CSS_PREFIX}__statuses { display: flex; flex-wrap: wrap; gap: 5px; }
.${CSS_PREFIX}__status { padding: 5px 7px; border-radius: 5px; background: var(--dsw-alias-bg-layer-2, #f2f3f5); color: inherit; font-size: 11px; }
.${CSS_PREFIX}__status--active { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 18%, transparent); color: var(--dsw-alias-state-business-primary, #4d6bfe); }
.${CSS_PREFIX}__actions { display: flex; flex-wrap: wrap; gap: 6px; }
.${CSS_PREFIX}__button { min-height: 30px; padding: 4px 9px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2, #f2f3f5); color: inherit; font-size: 12px; }
.${CSS_PREFIX}__button--primary { background: var(--dsw-alias-state-business-primary, #4d6bfe); color: #fff; }
.${CSS_PREFIX}__notice { padding: 7px 8px; border-radius: 5px; background: color-mix(in srgb, var(--dsw-alias-state-warning-primary, #b87900) 12%, transparent); color: var(--dsw-alias-label-secondary, #5c6370); font-size: 11px; }
.${CSS_PREFIX}__empty { padding: 14px 4px; color: var(--dsw-alias-label-tertiary, #8b919b); text-align: center; font-size: 12px; }
@media (max-width: 560px) { .${CSS_PREFIX}__panel { position: fixed; inset: 8px; top: 8px; right: 8px; width: auto; max-height: none; } .${CSS_PREFIX}__filters { grid-template-columns: 1fr; } }
`

export function installStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (tag === null) {
    tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent = STYLESHEET
    tag.dataset[HOLDERS_ATTRIBUTE] = '0'
    document.head.append(tag)
  }
  tag.dataset[HOLDERS_ATTRIBUTE] = String(holdersOf(tag) + 1)
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    const live = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (live === null) return
    const remaining = holdersOf(live) - 1
    if (remaining > 0) live.dataset[HOLDERS_ATTRIBUTE] = String(remaining)
    else live.remove()
  }
}

function holdersOf(tag: HTMLStyleElement): number {
  const parsed = Number.parseInt(tag.dataset[HOLDERS_ATTRIBUTE] ?? '', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1
}
