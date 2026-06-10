import { Languages } from 'lucide-react'
import { useLanguage } from '../../context/language.js'

function LanguageToggle({ mode = 'button', className = '' }) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage()

  if (mode === 'select') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ['en', 'EN', t('common.english', 'English')],
          ['vi', 'VI', t('common.vietnamese', 'Vietnamese')],
        ].map(([value, short, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setLanguage(value)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
              language === value
                ? 'border-[var(--accent)] bg-sky-50 text-[#0ea5e9] dark:bg-sky-950/40 dark:text-[#38bdf8]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <span className="text-xs font-bold tracking-[0.18em]">{short}</span>
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-label={t('common.language', 'Language')}
      onClick={toggleLanguage}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
    >
      <Languages size={16} />
      {language.toUpperCase()}
    </button>
  )
}

export default LanguageToggle
