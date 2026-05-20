function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export default Select
