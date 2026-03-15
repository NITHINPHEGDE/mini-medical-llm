import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class APIClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for token
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('token')
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
      }
      return config
    })

    // Add response interceptor for 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  public setToken(token: string): void {
    this.token = token
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  public getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new APIClient()
