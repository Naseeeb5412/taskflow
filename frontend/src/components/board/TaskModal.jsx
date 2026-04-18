import { useState } from 'react'
import { Trash2, Clock, Activity } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import useBoardStore from '../../store/boardStore'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const LABELS = ['', 'bug', 'feature', 'improvement', 'documentation', 'design']
const LABEL_DISPLAY = { '': 'None', bug: 'Bug', feature: 'Feature', improvement: 'Improvement', documentation: 'Documentation', design: 'Design' }

export default function TaskModal({ task, listId, lists, onClose }) {
  const isEdit = Boolean(task)
  const { createTask, updateTask, deleteTask } = useBoardStore()

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    label: task?.label || '',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    list: task?.list || listId,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = { ...form, dueDate: form.dueDate || null }
      if (isEdit) {
        await updateTask(task._id, payload)
        toast.success('Task updated')
      } else {
        await createTask(payload)
        toast.success('Task created')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(task._id)
      toast.success('Task deleted')
      onClose()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  return (
    <Modal title={isEdit ? 'Edit Task' : 'New Task'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
          <input className={`input ${errors.title ? 'border-red-500' : ''}`} placeholder="What needs to be done?" value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Add more details…" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

      

        <div className="flex gap-3 pt-2">
          {isEdit && (
            <button type="button" onClick={handleDelete} className="btn-danger flex items-center gap-2">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
