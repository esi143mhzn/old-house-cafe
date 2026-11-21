import client, { authToken } from './client'

export async function login(email, password) {
  const { data } = await client.post('/login', { email, password })
  authToken.set(data.token)
  return data.user
}

export async function getMe() {
  const { data } = await client.get('/me')
  return data.user
}

export async function logout() {
  try {
    await client.post('/logout')
  } finally {
    authToken.clear()
  }
}