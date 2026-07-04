// ABOUTME: Renders a transient toast with an action inside a persistent polite live region.
// ABOUTME: Moves focus to the action on open and pauses dismissal while hovered or focused.
import { useEffect, useRef } from 'react'

export type ToastData = {
  id: number
  message: string
  actionLabel?: string
}

type ToastProps = {
  toast: ToastData | null
  onAction: () => void
  onPause: () => void
  onResume: () => void
}

export function Toast({ toast, onAction, onPause, onResume }: ToastProps) {
  const actionRef = useRef<HTMLButtonElement>(null)
  const toastId = toast?.id

  useEffect(() => {
    if (toastId !== undefined) actionRef.current?.focus()
  }, [toastId])

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
          {toast.actionLabel && (
            <button
              ref={actionRef}
              type="button"
              className="toast-action"
              onClick={onAction}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
