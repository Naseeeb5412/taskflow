import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    set({ error: null })
    const { data } = await api.post('/auth/login', { email, password })
    set({ user: data.user })
    return data.user
  },

  register: async (name, email, password) => {
    set({ error: null })
    const { data } = await api.post('/auth/register', { name, email, password })
    set({ user: data.user })
    return data.user
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  },
}))

export default useAuthStore
