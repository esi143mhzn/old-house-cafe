export default function Select({
  label,
  error,
  className = '',
  id,
  children,
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}