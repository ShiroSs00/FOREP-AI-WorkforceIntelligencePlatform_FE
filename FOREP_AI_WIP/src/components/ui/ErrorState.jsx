function ErrorState({ title = 'Backend API is not connected yet.', description = 'Connect the backend service or enable VITE_USE_MOCKS for visual development.' }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <p className="font-semibold text-amber-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-amber-800">{description}</p>
    </div>
  )
}

export default ErrorState
