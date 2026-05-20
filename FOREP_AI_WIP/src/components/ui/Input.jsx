function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:placeholder:text-slate-500 dark:focus:ring-sky-950 ${className}`}
      {...props}
    />
  )
}

export default Input
