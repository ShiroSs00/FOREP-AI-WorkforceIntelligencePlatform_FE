function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const variants = {
    primary: 'border-[#0284c7] bg-[#0ea5e9] text-white hover:bg-sky-600 dark:border-[#38bdf8] dark:bg-[#0284c7] dark:text-white dark:hover:bg-sky-500',
    secondary: 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'border-[#dc2626] bg-[#ef4444] text-white hover:bg-red-600 dark:border-red-400 dark:bg-red-600 dark:hover:bg-red-500',
    ghost: 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-75 dark:focus-visible:ring-sky-900 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
