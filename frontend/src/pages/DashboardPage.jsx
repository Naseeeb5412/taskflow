import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Layout, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import useBoardStore from '../store/boardStore'
import Navbar from '../components/common/Navbar'
import Modal from '../components/common/Modal'
import Spinner from '../components/common/Spinner'



function CreateBoardModal({ onClose }) {
  const [form, setForm] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const createBoard = useBoardStore((s) => s.createBoard)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return }
    setLoading(true)
    try {
      await createBoard(form)
      toast.success('Board created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create board')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Board" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
          <input className={`input ${errors.title ? 'border-red-500' : ''}`} placeholder="e.g. Marketing Campaign" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({}) }} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={2} placeholder="Optional description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating…' : 'Create Board'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function DashboardPage() {
  const { boards, loading, fetchBoards, deleteBoard } = useBoardStore()
  const [showCreate, setShowCreate] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchBoards() }, [])

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this board and all its data?')) return
    setDeletingId(id)
    try {
      await deleteBoard(id)
      toast.success('Board deleted')
    } catch {
      toast.error('Failed to delete board')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">My Boards</h1>
              <p className="text-slate-500 text-sm mt-0.5">{boards.length} board{boards.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Board
            </button>
          </div>

          {loading ? <Spinner /> : boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Layout size={28} className="text-slate-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-300 mb-2">No boards yet</h2>
              <p className="text-slate-500 text-sm mb-6">Create your first board to get started</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} className="inline mr-2" />Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {boards.map((board) => (
                <Link key={board._id} to={`/board/${board._id}`}
                  className="group relative card hover:border-slate-600 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden">
                 
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-100 group-hover:text-white leading-snug flex-1 line-clamp-2">{board.title}</h3>
                      <button onClick={(e) => handleDelete(e, board._id)} disabled={deletingId === board._id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {board.description && (
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{board.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-3 text-slate-600 text-xs">
                      <Calendar size={11} />
                      <span>{format(new Date(board.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))}

              <button onClick={() => setShowCreate(true)}
                className="card border-dashed border-slate-700 hover:border-brand-500/50 hover:bg-brand-600/5 transition-all duration-200 p-4 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-brand-400 min-h-[100px] group">
                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">New Board</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
