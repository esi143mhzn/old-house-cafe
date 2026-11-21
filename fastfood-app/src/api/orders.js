import client from './client'

// filters: { date, date_from, date_to, status, payment_status }
export async function fetchOrders(filters = {}, page = 1) {
  const params = { ...filters, page }
  const { data } = await client.get('/orders', { params })
  return data
}

// data: { order_type, table_number, discount, items: [{menu_id, quantity}] }
export async function createOrder(payload) {
  const { data } = await client.post('/orders', payload)
  return data
}

export async function fetchOrder(id) {
  const { data } = await client.get(`/orders/${id}`)
  return data.data
}

// Update payment/status: { payment_status, payment_method, status }
export async function updateOrder(id, payload) {
  const { data } = await client.put(`/orders/${id}`, payload)
  return data
}