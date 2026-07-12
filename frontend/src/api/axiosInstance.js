import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('transitops_token')
      localStorage.removeItem('transitops_user')
      localStorage.removeItem('transitops_role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
