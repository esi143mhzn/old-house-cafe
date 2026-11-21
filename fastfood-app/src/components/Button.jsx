export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-orange-500 hover:bg-orange-600 text-white shadow-sm disabled:bg-orange-300',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 disabled:text-slate-400',
    danger:
      'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-300',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 disabled:text-slate-300',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}