import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message, variant = 'default') => {
      const id = ++idSeq
      setToasts((prev) => [...prev, { id, message, variant }])
      const t = setTimeout(() => dismiss(id), 4200)
      timers.current.set(id, t)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast: push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex max-w-sm flex-col gap-2"
            aria-live="polite"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className={[
                  'pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md transition',
                  t.variant === 'danger'
                    ? 'border-red-500/30 bg-red-950/90 text-red-100'
                    : t.variant === 'success'
                      ? 'border-emerald-500/25 bg-emerald-950/85 text-emerald-50'
                      : 'border-white/10 bg-[#0b1524]/95 text-slate-100',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-snug">{t.message}</p>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
