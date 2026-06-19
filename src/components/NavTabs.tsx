// ABOUTME: Renders an accessible tablist with roving focus and arrow-key navigation.
// ABOUTME: Drives the view switcher while leaving panel rendering to the caller.
import { useRef, type KeyboardEvent } from 'react'

type NavTabsProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>
  active: T
  label: string
  onChange: (id: T) => void
}

export function NavTabs<T extends string>({
  tabs,
  active,
  label,
  onChange,
}: NavTabsProps<T>) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1
    let next = index

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = index === last ? 0 : index + 1
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = index === 0 ? last : index - 1
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = last
    } else {
      return
    }

    event.preventDefault()
    onChange(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="view-tabs">
      {tabs.map((tab, index) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={selected ? `panel-${tab.id}` : undefined}
            tabIndex={selected ? 0 : -1}
            className={`view-tab ${selected ? 'is-active' : ''}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
