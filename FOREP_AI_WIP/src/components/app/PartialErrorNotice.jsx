function PartialErrorNotice({ failures = [] }) {
  if (!failures.length) return null

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
      <p className="font-semibold">Some dashboard data could not be loaded.</p>
      <p className="mt-1">FOREP is showing the sections that loaded successfully. Retry after the backend finishes processing the unavailable sections.</p>
    </div>
  )
}

export default PartialErrorNotice
