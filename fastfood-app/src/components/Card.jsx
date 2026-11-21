export default function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {title && (
        <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      )}
      {children}
    </div>
  )
}