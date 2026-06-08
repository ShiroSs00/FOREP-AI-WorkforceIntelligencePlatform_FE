function Table({ columns, rows, renderRow, empty }) {
  if (!rows.length) return empty ?? null

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm shadow-slate-200/70 dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-slate-50/90 dark:bg-slate-950/70">
            <tr>{columns.map((column) => <th key={column} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
