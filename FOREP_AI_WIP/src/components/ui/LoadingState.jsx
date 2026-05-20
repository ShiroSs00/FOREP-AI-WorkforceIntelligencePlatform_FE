function LoadingState({ message = 'Loading product data...' }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0ea5e9]" />
      <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>
    </div>
  )
}

export default LoadingState
