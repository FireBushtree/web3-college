import axios from 'axios'

// API utilities for making requests to the backend
const API_BASE = '/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  (error) => {
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
  // Test endpoint to verify proxy configuration
  async health() {
    try {
      const response = await apiClient.get('/health')
      return response.data
    }
    catch (error) {
      console.error('API health check failed:', error)
      return { status: 'error', message: 'Proxy configuration may not be working' }
    }
  },

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
      return response.data
    }
    catch (error) {
      console.error('Get courses API failed:', error)
      throw error
    }
  },
}
