const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-slate-100 text-slate-600',
  paid: 'bg-emerald-100 text-emerald-700',
  dine_in: 'bg-violet-100 text-violet-700',
  takeaway: 'bg-cyan-100 text-cyan-700',
  cash: 'bg-lime-100 text-lime-700',
  qr: 'bg-teal-100 text-teal-700',
  admin: 'bg-purple-100 text-purple-700',
  staff: 'bg-slate-100 text-slate-600',
}

export function labelFor(value) {
  if (value === 'qr') return 'QR / Digital'
  return (value || '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function StatusBadge({ value, className = '' }) {
  if (!value) return <span className="text-slate-400">—</span>
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[value] || 'bg-slate-100 text-slate-600'} ${className}`}
    >
      {labelFor(value)}
    </span>
  )
}