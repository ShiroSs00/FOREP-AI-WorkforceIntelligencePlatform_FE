function Card({ children, className = '', ...props }) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 text-[var(--text)] shadow-sm shadow-slate-200/70 backdrop-blur transition-colors duration-200 dark:bg-slate-900/92 dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default Card
