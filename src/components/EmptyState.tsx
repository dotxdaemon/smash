// ABOUTME: Renders a centered empty-state message with an optional primary action.
// ABOUTME: Shared by the history and stats views when no sets exist yet.
type EmptyStateProps = {
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
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
