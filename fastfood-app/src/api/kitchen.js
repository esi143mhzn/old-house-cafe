import client from './client'

export async function fetchKitchenOrders() {
  const { data } = await client.get('/kitchen/orders')
  return data.data
}

export async function updateKitchenStatus(id, status) {
  const { data } = await client.put(`/kitchen/orders/${id}/status`, { status })
  return data
}