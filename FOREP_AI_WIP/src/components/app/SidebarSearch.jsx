import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

function SidebarSearch({ placeholder }) {
  const inputRef = useRef(null)

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <label className="relative mt-4 block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-slate-50 pl-9 pr-12 text-sm text-[var(--text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-sky-100 dark:bg-slate-900 dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">⌘K</span>
    </label>
  )
}

export default SidebarSearch
