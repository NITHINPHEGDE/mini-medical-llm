export interface User {
  id?: string
  email: string
  name?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SymptomAssessment {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  medicalHistory?: string[]
}
