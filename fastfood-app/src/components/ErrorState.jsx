export default function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-red-50 py-10 text-center">
      <span className="text-3xl" aria-hidden="true">
        ⚠️
      </span>
      <h3 className="text-base font-semibold text-red-700">Error</h3>
      <p className="max-w-sm text-sm text-red-600">{message}</p>
    </div>
  )
}