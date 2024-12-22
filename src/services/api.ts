import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// API endpoints
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout')
}

export const productsAPI = {
  getAll: () => api.get('/products'),
  getOne: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products?featured=true')
}

export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId: string, quantity: number) => api.post('/cart', { productId, quantity }),
  updateItem: (productId: string, quantity: number) => api.put('/cart', { productId, quantity }),
  removeItem: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart')
}

export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id: string) => api.get(`/orders/${id}`)
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  updatePassword: (data: any) => api.put('/user/password', data)
}

export default api
