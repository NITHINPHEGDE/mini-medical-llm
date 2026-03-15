'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/types'
import { apiService } from '@/services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser)

    setToken(storedToken)
    setUser(parsedUser)

    apiService.setToken(storedToken)
  } catch (error) {
    console.error("Invalid stored user. Clearing storage.")

    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }
}


    setIsLoading(false)
  }, [])
const login = async (email: string, password: string) => {
  try {
    setIsLoading(true)

    const response = await apiService.login(email, password)

    const newToken = response.access_token

    if (!newToken) {
      throw new Error("No access token received")
    }

    const userData = {
      email: email,
    }

    setUser(userData)
    setToken(newToken)

    apiService.setToken(newToken)

    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(userData))

  } catch (error) {
    console.error("Login failed:", error)
    throw error
  } finally {
    setIsLoading(false)
  }
}


  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.signup(email, password)

const newToken = response.access_token

setToken(newToken)
apiService.setToken(newToken)

localStorage.setItem("token", newToken)

const userData = { email }
setUser(userData)
localStorage.setItem("user", JSON.stringify(userData))


      setUser(userData)
      setToken(newToken)
      apiService.setToken(newToken)

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
