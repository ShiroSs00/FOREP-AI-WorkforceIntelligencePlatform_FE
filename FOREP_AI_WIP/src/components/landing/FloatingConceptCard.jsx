function FloatingConceptCard({ children, className = '', style }) {
  return (
    <div className={`floating-concept rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-sky-100 shadow-2xl shadow-slate-950/30 backdrop-blur ${className}`} style={style}>
      {children}
    </div>
  )
}

export default FloatingConceptCard
