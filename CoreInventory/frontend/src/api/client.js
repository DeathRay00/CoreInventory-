import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ci_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Standardized error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ci_token')
      localStorage.removeItem('ci_user')
      window.location.href = '/login'
    }
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.detail ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  requestReset: (email) => api.post('/auth/request-reset', { email }),
  resetPassword: (data)  => api.post('/auth/reset-password', data),
}

// ── Products & Categories ─────────────────────────────────
export const productsApi = {
  list:   (params) => api.get('/products', { params }),
  create: (data)   => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id)     => api.delete(`/products/${id}`),
  get:    (id)     => api.get(`/products/${id}`),
}

export const categoriesApi = {
  list:   (params) => api.get('/categories', { params }),
  create: (data)   => api.post('/categories', data),
}

// ── Warehouses & Locations ────────────────────────────────
export const warehousesApi = {
  list:   (params) => api.get('/warehouses', { params }),
  create: (data)   => api.post('/warehouses', data),
  get:    (id)     => api.get(`/warehouses/${id}`),
}

export const locationsApi = {
  list:   (params) => api.get('/locations', { params }),
  create: (data)   => api.post('/locations', data),
}

// ── Receipts ──────────────────────────────────────────────
export const receiptsApi = {
  list:     (params) => api.get('/receipts', { params }),
  create:   (data)   => api.post('/receipts', data),
  validate: (id)     => api.post(`/receipts/${id}/validate`),
}

// ── Deliveries ────────────────────────────────────────────
export const deliveriesApi = {
  list:     (params) => api.get('/deliveries', { params }),
  create:   (data)   => api.post('/deliveries', data),
  validate: (id)     => api.post(`/deliveries/${id}/validate`),
}

// ── Transfers ─────────────────────────────────────────────
export const transfersApi = {
  list:   (params) => api.get('/transfers', { params }),
  create: (data)   => api.post('/transfers', data),
}

// ── Adjustments ───────────────────────────────────────────
export const adjustmentsApi = {
  list:   (params) => api.get('/adjustments', { params }),
  create: (data)   => api.post('/adjustments', data),
}

// ── Stock & Ledger ────────────────────────────────────────
export const stockApi = {
  list:   (params) => api.get('/stock', { params }),
}

export const ledgerApi = {
  list:   (params) => api.get('/ledger', { params }),
}

// ── Dashboard ─────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export default api
