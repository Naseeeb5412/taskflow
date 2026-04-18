import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, MouseSensor, TouchSensor,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Plus, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Spinner from '../components/common/Spinner'
import ListColumn from '../components/board/ListColumn'
import TaskCard from '../components/board/TaskCard'
import TaskModal from '../components/board/TaskModal'
import useBoardStore from '../store/boardStore'
import api from '../utils/api'

export default function BoardPage() {
  const { boardId } = useParams()
  const { currentBoard, lists, tasks, loading, error, fetchBoardDetail, createList, setLists, setTasks } = useBoardStore()
  const [taskModal, setTaskModal] = useState(null) // { mode: 'create'|'edit', listId?, task? }
  const [addListInput, setAddListInput] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  useEffect(() => { fetchBoardDetail(boardId) }, [boardId])

  const getTasksForList = useCallback(
    (listId) => tasks.filter((t) => t.list === listId).sort((a, b) => a.order - b.order),
    [tasks]
  )

  const handleAddList = async (e) => {
    e.preventDefault()
    if (!addListInput.trim()) return
    try {
      await createList(boardId, addListInput.trim())
      setAddListInput('')
      setShowAddList(false)
      toast.success('List added')
    } catch {
      toast.error('Failed to add list')
    }
  }

  const handleDragStart = ({ active }) => {
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task)
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const activeType = active.data.current?.type
    if (activeType !== 'task') return

    const activeTask = tasks.find((t) => t._id === active.id)
    if (!activeTask) return

    const overListId = over.data.current?.type === 'list'
      ? over.data.current.listId
      : tasks.find((t) => t._id === over.id)?.list

    if (!overListId) return

    const sourceListId = activeTask.list
    const sourceList = tasks.filter((t) => t.list === sourceListId).sort((a, b) => a.order - b.order)
    const destList = tasks.filter((t) => t.list === overListId && t._id !== activeTask._id).sort((a, b) => a.order - b.order)

    let newOrder = 0

    if (sourceListId === overListId) {
    
      const overTaskIndex = sourceList.findIndex((t) => t._id === over.id)
      const activeIndex = sourceList.findIndex((t) => t._id === activeTask._id)
      if (activeIndex === -1 || overTaskIndex === -1) return
      const reordered = arrayMove(sourceList, activeIndex, overTaskIndex)
      const updated = tasks.map((t) => {
        const idx = reordered.findIndex((r) => r._id === t._id)
        return idx !== -1 ? { ...t, order: idx } : t
      })
      setTasks(updated)
      newOrder = overTaskIndex

      try {
        await api.put('/tasks/reorder', {
          tasks: reordered.map((t, i) => ({ _id: t._id, order: i, list: t.list })),
        })
      } catch { fetchBoardDetail(boardId) }
    } else {
      // Move to different list
      const overIndex = destList.findIndex((t) => t._id === over.id)
      newOrder = overIndex >= 0 ? overIndex : destList.length

      const updated = tasks.map((t) =>
        t._id === activeTask._id ? { ...t, list: overListId, order: newOrder } : t
      )
      setTasks(updated)

      try {
        await api.put(`/tasks/${activeTask._id}/move`, { listId: overListId, order: newOrder })
      } catch { fetchBoardDetail(boardId) }
    }
  }

  if (loading && !currentBoard) return <div className="min-h-screen bg-slate-950"><Navbar /><div className="pt-14"><Spinner /></div></div>
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-red-400">{error}</p></div>

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Board header */}
      <div className="mt-14 px-4 py-3 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ChevronLeft size={18} />
          </Link>
          {currentBoard && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentBoard.color }} />
              <h1 className="font-extrabold text-lg text-slate-100">{currentBoard.title}</h1>
              {currentBoard.description && (
                <span className="text-slate-500 text-sm hidden sm:block">— {currentBoard.description}</span>
              )}
            </div>
          )}
          <div className="ml-auto text-sm text-slate-600 font-mono">
            {lists.length} lists · {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Board canvas */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start min-w-max">
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={getTasksForList(list._id)}
                onAddTask={(listId) => setTaskModal({ mode: 'create', listId })}
                onEditTask={(task) => setTaskModal({ mode: 'edit', task })}
              />
            ))}

            {/* Add list */}
            <div className="flex-shrink-0 w-72">
              {showAddList ? (
                <form onSubmit={handleAddList} className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 space-y-2">
                  <input
                    autoFocus
                    className="input text-sm"
                    placeholder="List name…"
                    value={addListInput}
                    onChange={(e) => setAddListInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setShowAddList(false)}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm py-1.5 px-4">Add list</button>
                    <button type="button" onClick={() => { setShowAddList(false); setAddListInput('') }} className="btn-ghost text-sm">Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-300 bg-slate-800/40 hover:bg-slate-800/70 border border-dashed border-slate-700 hover:border-slate-600 rounded-2xl px-4 py-3 transition-all duration-150 text-sm font-medium"
                >
                  <Plus size={15} /> Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeTask && (
              <div className="rotate-2 opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task modal */}
      {taskModal && (
        <TaskModal
          task={taskModal.task}
          listId={taskModal.listId || taskModal.task?.list}
          lists={lists}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  )
}
