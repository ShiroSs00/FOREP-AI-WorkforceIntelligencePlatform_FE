function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-[#0ea5e9] text-white hover:bg-sky-600 border-[#0ea5e9]',
    secondary: 'bg-[var(--surface)] text-[var(--text)] hover:bg-slate-50 border-[var(--border)] dark:hover:bg-slate-900',
    danger: 'bg-[#ef4444] text-white hover:bg-red-600 border-[#ef4444]',
    ghost: 'bg-transparent text-[var(--muted)] hover:bg-slate-100 border-transparent dark:hover:bg-slate-900',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
