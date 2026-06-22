import Button from './Button.jsx'

function ErrorState({ title = 'Không thể tải dữ liệu.', message, description = 'Vui lòng thử lại hoặc kiểm tra quyền truy cập tài khoản.', status, details, onRetry }) {
  const body = message ?? description
  const detailsText = typeof details === 'string' ? details : details ? JSON.stringify(details, null, 2) : ''
  const hasTechnicalDetails = import.meta.env.DEV && Boolean(detailsText)
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/70 dark:bg-amber-950/30">
      <p className="font-semibold text-amber-900 dark:text-amber-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">{body}</p>
      {status && import.meta.env.DEV ? <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Status {status}</p> : null}
      {hasTechnicalDetails ? (
        <details className="mt-3 text-xs text-amber-800 dark:text-amber-200">
          <summary className="cursor-pointer font-semibold">Chi tiết kỹ thuật</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-white/70 p-3 dark:bg-slate-950/50">{detailsText}</pre>
        </details>
      ) : null}
      {onRetry ? <div className="mt-4"><Button variant="secondary" onClick={onRetry}>Thử lại</Button></div> : null}
    </div>
  )
}

export default ErrorState
