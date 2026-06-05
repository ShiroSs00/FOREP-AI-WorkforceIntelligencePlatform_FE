function Card({ children, className = '', ...props }) {
  return <section className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-sm dark:shadow-none ${className}`} {...props}>{children}</section>
}

export default Card
