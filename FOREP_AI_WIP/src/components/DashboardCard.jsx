function DashboardCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default DashboardCard
