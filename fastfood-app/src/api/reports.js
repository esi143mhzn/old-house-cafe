import client from './client'

// period: today | yesterday | week | month | custom (date_from, date_to)
export async function fetchSalesReport(params = {}) {
  const { data } = await client.get('/reports/sales', { params })
  return data.data
}