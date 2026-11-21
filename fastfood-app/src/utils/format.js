export function formatMoney(value) {
  const num = Number(value || 0)
  return `Rs. ${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}