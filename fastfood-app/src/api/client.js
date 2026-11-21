import axios from 'axios'

const TOKEN_KEY = 'ff_token'

export const authToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// Shared Axios instance.
// The dev server proxies /api -> http://127.0.0.1:8000 (see vite.config.js)
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { Accept: 'application/json' },
})

// Attach the Sanctum bearer token to every request.
client.interceptors.request.use((config) => {
  const token = authToken.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize API errors into a simple Error with the server message attached.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data || {}
      const message = data.message || 'Something went wrong. Please try again.'
      const err = new Error(message)
      err.status = error.response.status
      err.errors = data.errors || null
      if (error.response.status === 401) {
        authToken.clear()
      }
      return Promise.reject(err)
    }
    return Promise.reject(new Error('Network error. Is the server running?'))
  }
)

export default client