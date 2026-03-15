import axios, { AxiosInstance, AxiosError } from "axios"

class ApiService {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    const savedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (savedToken) {
      this.token = savedToken
    }

    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken()
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem("token", token)
  }

  clearToken() {
    this.token = null
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/login", { email, password })
    return response.data
  }

  async signup(email: string, password: string) {
    const response = await this.client.post("/signup", { email, password })
    return response.data
  }

  async createConversation(title?: string) {
    const response = await this.client.post("/chat/new", {
      title: title || "New Chat",
    })
    return response.data
  }

  async getConversations() {
    const response = await this.client.get("/chat/all")
    return response.data
  }

  async getMessages(conversationId: string) {
    const response = await this.client.get(
      `/chat/messages/${conversationId}`
    )
    return response.data
  }

  async chat(question: string, conversationId: string) {
    const response = await this.client.post("/ask", {
      question,
      conversation_id: conversationId,
    })
    return response.data
  }
}

export const apiService = new ApiService()
