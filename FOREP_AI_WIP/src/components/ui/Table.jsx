function Table({ columns, rows, renderRow, empty }) {
  if (!rows.length) return empty ?? null

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
