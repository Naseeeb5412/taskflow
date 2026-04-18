import { create } from 'zustand'
import api from '../utils/api'

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  tasks: [],
  loading: false,
  error: null,

  // ─── Boards ───────────────────────────────────
  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/boards')
      set({ boards: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load boards', loading: false })
    }
  },

  createBoard: async (payload) => {
    const { data } = await api.post('/boards', payload)
    set((s) => ({ boards: [data, ...s.boards] }))
    return data
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`)
    set((s) => ({ boards: s.boards.filter((b) => b._id !== id) }))
  },

  // ─── Board detail ─────────────────────────────
  fetchBoardDetail: async (boardId) => {
    set({ loading: true, error: null })
    try {
      const [boardRes, listsRes, tasksRes] = await Promise.all([
        api.get(`/boards/${boardId}`),
        api.get(`/lists/board/${boardId}`),
        api.get(`/tasks/board/${boardId}`),
      ])
      set({
        currentBoard: boardRes.data,
        lists: listsRes.data,
        tasks: tasksRes.data,
        loading: false,
      })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load board', loading: false })
    }
  },

  // ─── Lists ────────────────────────────────────
  createList: async (boardId, title) => {
    const { data } = await api.post(`/lists/board/${boardId}`, { title })
    set((s) => ({ lists: [...s.lists, data] }))
    return data
  },

  updateList: async (id, payload) => {
    const { data } = await api.put(`/lists/${id}`, payload)
    set((s) => ({ lists: s.lists.map((l) => (l._id === id ? data : l)) }))
    return data
  },

  deleteList: async (id) => {
    await api.delete(`/lists/${id}`)
    set((s) => ({
      lists: s.lists.filter((l) => l._id !== id),
      tasks: s.tasks.filter((t) => t.list !== id),
    }))
  },

  setLists: (lists) => set({ lists }),

  // ─── Tasks ────────────────────────────────────
  createTask: async (payload) => {
    const { data } = await api.post('/tasks', payload)
    set((s) => ({ tasks: [...s.tasks, data] }))
    return data
  },

  updateTask: async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload)
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === id ? data : t)) }))
    return data
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`)
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }))
  },

  moveTask: async (taskId, listId, order) => {
    // Optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === taskId ? { ...t, list: listId, order } : t)),
    }))
    try {
      await api.put(`/tasks/${taskId}/move`, { listId, order })
    } catch {
      // rollback on failure — refetch
      const { currentBoard } = get()
      if (currentBoard) get().fetchBoardDetail(currentBoard._id)
    }
  },

  setTasks: (tasks) => set({ tasks }),
}))

export default useBoardStore
