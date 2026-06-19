// ABOUTME: Renders a centered empty-state message with an optional primary action.
// ABOUTME: Shared by the history and stats views when no sets exist yet.
type EmptyStateProps = {
  glyph: string
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  glyph,
  title,
  text,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-glyph" aria-hidden="true">
        {glyph}
      </span>
      <p className="empty-title">{title}</p>
      <p className="empty-text">{text}</p>
      {actionLabel && onAction && (
        <button type="button" className="empty-cta" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
