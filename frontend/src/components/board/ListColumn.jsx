import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import TaskCard from './TaskCard'
import useBoardStore from '../../store/boardStore'

export default function ListColumn({ list, tasks, onAddTask, onEditTask }) {
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { updateList, deleteList, createTask } = useBoardStore()
  const inputRef = useRef(null)
  const addRef = useRef(null)

  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { type: 'list', listId: list._id } })

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { if (addingTask) addRef.current?.focus() }, [addingTask])

  const handleRename = async () => {
    if (!title.trim()) { setTitle(list.title); setEditing(false); return }
    if (title === list.title) { setEditing(false); return }
    try {
      await updateList(list._id, { title })
      toast.success('List renamed')
    } catch {
      setTitle(list.title)
      toast.error('Failed to rename list')
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${list.title}" and all its tasks?`)) return
    try {
      await deleteList(list._id)
      toast.success('List deleted')
    } catch {
      toast.error('Failed to delete list')
    }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      await createTask({ title: newTaskTitle.trim(), list: list._id })
      setNewTaskTitle('')
      toast.success('Task added')
    } catch {
      toast.error('Failed to add task')
    }
  }

  return (
    <div className="flex-shrink-0 w-72">
      <div className={`flex flex-col max-h-[calc(100vh-9rem)] rounded-2xl border transition-colors duration-150 ${isOver ? 'border-brand-500/50 bg-brand-600/5' : 'border-slate-700/60 bg-slate-900/80'}`}>
        {}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-700/50">
          {editing ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                ref={inputRef}
                className="input py-1 text-sm font-semibold flex-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setTitle(list.title); setEditing(false) } }}
              />
              <button onClick={handleRename} className="p-1 text-green-400 hover:bg-green-400/10 rounded">
                <Check size={14} />
              </button>
              <button onClick={() => { setTitle(list.title); setEditing(false) }} className="p-1 text-slate-500 hover:bg-slate-700 rounded">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-sm text-slate-200 flex-1 truncate">{list.title}</h3>
              <span className="text-xs bg-slate-700 text-slate-400 rounded-full px-2 py-0.5 font-mono">{tasks.length}</span>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="btn-ghost p-1.5 text-slate-500">
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1 w-40 animate-scale-in">
                    <button onClick={() => { setEditing(true); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                      <Pencil size={13} /> Rename
                    </button>
                    <button onClick={() => { handleDelete(); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                      <Trash2 size={13} /> Delete list
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {}
        <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[40px]">
          <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onClick={() => onEditTask(task)} />
            ))}
          </SortableContext>
        </div>

        {}
        <div className="p-2 border-t border-slate-700/50">
          {addingTask ? (
            <form onSubmit={handleQuickAdd} className="space-y-2">
              <textarea
                ref={addRef}
                className="input text-sm resize-none"
                rows={2}
                placeholder="Task title…"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickAdd(e) }
                  if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle('') }
                }}
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">Add</button>
                <button type="button" onClick={() => { setAddingTask(false); setNewTaskTitle('') }} className="btn-ghost text-xs">
                  <X size={13} />
                </button>
                <button type="button" onClick={() => { setAddingTask(false); onAddTask(list._id) }} className="btn-ghost text-xs ml-auto text-slate-500">
                  More options
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAddingTask(true)} className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-700/50 transition-colors">
              <Plus size={14} /> Add task
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
