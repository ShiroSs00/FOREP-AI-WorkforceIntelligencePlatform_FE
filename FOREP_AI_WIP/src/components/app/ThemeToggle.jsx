import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/theme.js'

function ThemeToggle({ mode = 'button', className = '' }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const Icon = resolvedTheme === 'dark' ? Moon : Sun

  if (mode === 'select') {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ['light', Sun, 'Light'],
          ['dark', Moon, 'Dark'],
          ['system', Monitor, 'System'],
        ].map(([value, OptionIcon, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
              theme === value
                ? 'border-[var(--accent)] bg-sky-50 text-[#0ea5e9] dark:bg-sky-950/40 dark:text-[#38bdf8]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <OptionIcon size={18} />
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-slate-800 transition hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
    >
      <Icon size={18} />
    </button>
  )
}

export default ThemeToggle
