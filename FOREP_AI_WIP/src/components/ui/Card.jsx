function Card({ children, className = '' }) {
  return <section className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-sm dark:shadow-none ${className}`}>{children}</section>
}

export default Card
