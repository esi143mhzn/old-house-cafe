import client from './client'

export async function fetchMenus() {
  const { data } = await client.get('/menus')
  return data.data
}

export async function fetchAvailableMenus() {
  const { data } = await client.get('/menus?availability=available')
  return data.data
}

export async function createMenu(payload) {
  const { data } = await client.post('/menus', payload)
  return data
}

export async function updateMenu(id, payload) {
  const { data } = await client.put(`/menus/${id}`, payload)
  return data
}

export async function deleteMenu(id) {
  const { data } = await client.delete(`/menus/${id}`)
  return data
}