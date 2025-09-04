import axios from 'axios'

// API utilities for making requests to the backend
const API_BASE = '/api'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-data')
    if (authData) {
      try {
        const { address, message, signature, timestamp, expiry } = JSON.parse(authData)
        config.headers['x-auth-address'] = address
        config.headers['x-auth-message'] = encodeURIComponent(message)
        config.headers['x-auth-signature'] = signature
        config.headers['x-auth-timestamp'] = timestamp.toString()
        config.headers['x-auth-expiry'] = expiry.toString()
      }
      catch (error) {
        console.error('Failed to parse auth data:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 401 未授权，清除本地认证数据并触发重新签名
      localStorage.removeItem('auth-data')

      // 通过自定义事件通知 auth hook 重新签名
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }

    if (error.response) {
      // Server responded with error status
      console.error(`API Error ${error.response.status}:`, error.response.data)
    }
    else if (error.request) {
      // Network error
      console.error('Network Error:', error.message)
    }
    else {
      // Request setup error
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  },
)

export const api = {
  // Course management endpoints
  async createCourse(courseData: { title: string, content: string, price: string, creator: string }) {
    try {
      // Map frontend fields to backend API format
      const apiData = {
        name: courseData.title,
        description: courseData.content,
        price: Number.parseFloat(courseData.price),
        creator: courseData.creator,
      }

      const response = await apiClient.post('/courses', apiData)
      return response.data
    }
    catch (error) {
      console.error('Create course API failed:', error)
      throw error
    }
  },

  async getCourses() {
    try {
      const response = await apiClient.get('/courses')
      return response.data?.data || []
    }
    catch (error) {
      console.error('Get courses API failed:', error)
      throw error
    }
  },

  async getCourse(id: string) {
    try {
      const response = await apiClient.get(`/courses/${id}`)
      return response.data?.data
    }
    catch (error) {
      console.error('Get course API failed:', error)
      throw error
    }
  },

  async getUserCourses() {
    try {
      const response = await apiClient.get(`/courses/user`)
      return response.data?.data || []
    }
    catch (error) {
      console.error('Get user courses API failed:', error)
      throw error
    }
  },

  async updateCourse(id: number, courseData: { name: string, description: string, price: number }) {
    try {
      const response = await apiClient.put(`/courses/${id}`, courseData)
      return response.data
    }
    catch (error) {
      console.error('Update course API failed:', error)
      throw error
    }
  },
}
