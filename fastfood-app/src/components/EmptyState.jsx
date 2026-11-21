export default function EmptyState({ title = 'Nothing here yet', message, icon = '🗒️' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
    </div>
  )
}