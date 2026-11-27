import { useEffect, useRef } from 'react'

/** True when the key press belongs to a text field, so shortcuts stay out of the way. */
export function typingIn(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement) return true
  return target instanceof HTMLInputElement && !['range', 'checkbox', 'radio', 'button'].includes(target.type)
}

/** Option index from a key: 1-4 or A-D (case-insensitive). */
export function optionIndex(key: string): number | null {
  if (/^[1-9]$/.test(key)) return Number(key) - 1
  if (/^[a-dA-D]$/.test(key)) return key.toUpperCase().charCodeAt(0) - 65
  return null
}

/**
 * Global keyboard shortcuts while a component is mounted. The handler gets
 * the event and returns true when it used it (default is then prevented).
 * Ignored while typing in a text field, and with Ctrl/Meta/Alt held.
 */
export function useKeys(handler: (e: KeyboardEvent) => boolean | void) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (typingIn(e.target) && e.key !== 'Escape') return
      if (ref.current(e) === true) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
