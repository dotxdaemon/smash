// ABOUTME: Renders a transient toast with an action inside a persistent polite live region.
// ABOUTME: Moves focus to the action on open unless the toast opts out; pauses while hovered.
import { useEffect, useRef } from 'react'

export type ToastData = {
  id: number
  message: string
  actionLabel: string
  focusAction?: boolean
}

type ToastProps = {
  toast: ToastData | null
  onAction: () => void
  onPause: () => void
  onResume: () => void
}

export function Toast({ toast, onAction, onPause, onResume }: ToastProps) {
  const actionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (toast && toast.focusAction !== false) actionRef.current?.focus()
  }, [toast])

  return (
    <div className="toast-tray" role="status" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className="toast"
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          onFocus={onPause}
          onBlur={onResume}
        >
          <span>{toast.message}</span>
          <button
            ref={actionRef}
            type="button"
            className="toast-action"
            onClick={onAction}
          >
            {toast.actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
