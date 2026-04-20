import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  fetchMe: async () => {
    // If login() already set a user, skip
    if (get().user) {
      set({ loading: false })
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, loading: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    set({ error: null })
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, loading: false })
    return data.user
  },

  register: async (name, email, password) => {
    set({ error: null })
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, loading: false })
    return data.user
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    set({ user: null })
  },
}))

export default useAuthStore
