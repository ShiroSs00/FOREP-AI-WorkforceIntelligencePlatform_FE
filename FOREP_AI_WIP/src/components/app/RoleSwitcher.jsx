import { useState } from 'react'
import { Check, ChevronDown, LockKeyhole } from 'lucide-react'
import { roleOptions, roles } from '../../constants/roles.js'
import { useRole } from '../../context/role.js'

function RoleSwitcher() {
  const { canPreviewRoles, roleConfig, selectedRole, setSelectedRole } = useRole()
  const [open, setOpen] = useState(false)

  const selectRole = (role) => {
    setSelectedRole(role)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!canPreviewRoles}
        onClick={() => canPreviewRoles && setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-white/80 p-3 text-left shadow-sm transition-colors hover:bg-white disabled:cursor-default dark:bg-slate-900/80 dark:hover:bg-slate-900"
        aria-label={canPreviewRoles ? 'Open admin role preview menu' : 'Role is assigned by your account'}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white shadow-sm shadow-sky-500/20">F</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--text)]">FOREP</span>
          <span className="block truncate text-xs text-[var(--muted)]">{roleConfig.subtitle}</span>
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-[var(--muted)] dark:bg-slate-800" title={canPreviewRoles ? 'Admin test role preview' : 'Role is assigned by your account'}>
          {canPreviewRoles ? <ChevronDown size={15} /> : <LockKeyhole size={15} />}
        </span>
      </button>

      {canPreviewRoles && open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl shadow-slate-200/80 dark:shadow-slate-950/60">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Admin test preview</p>
          {roleOptions.map((option) => {
            const active = option.value === selectedRole
            const config = roles[option.value]
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectRole(option.value)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${active ? 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200' : 'text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--text)] dark:hover:bg-slate-900'}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${config.accent === 'purple' ? 'bg-purple-500' : config.accent === 'green' ? 'bg-emerald-500' : config.accent === 'cyan' ? 'bg-cyan-500' : 'bg-sky-500'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="block text-xs opacity-75">{option.description}</span>
                </span>
                {active ? <Check size={15} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default RoleSwitcher
