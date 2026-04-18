import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Flag, Calendar, Tag, GripVertical } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

const PRIORITY_CONFIG = {
  low:    { color: 'text-slate-400',   bg: 'bg-slate-700/60',   dot: 'bg-slate-400',   label: 'Low' },
  medium: { color: 'text-blue-400',    bg: 'bg-blue-500/15',    dot: 'bg-blue-400',    label: 'Medium' },
  high:   { color: 'text-orange-400',  bg: 'bg-orange-500/15',  dot: 'bg-orange-400',  label: 'High' },
  urgent: { color: 'text-red-400',     bg: 'bg-red-500/15',     dot: 'bg-red-400',     label: 'Urgent' },
}

const LABEL_CONFIG = {
  bug:           { color: 'bg-red-500/20 text-red-400',           label: 'Bug' },
  feature:       { color: 'bg-brand-500/20 text-brand-400',       label: 'Feature' },
  improvement:   { color: 'bg-green-500/20 text-green-400',       label: 'Improvement' },
  documentation: { color: 'bg-yellow-500/20 text-yellow-400',     label: 'Docs' },
  design:        { color: 'bg-purple-500/20 text-purple-400',     label: 'Design' },
}

export default function TaskCard({ task, onClick }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task._id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const label = task.label && LABEL_CONFIG[task.label]

  const dueDateStatus = () => {
    if (!task.dueDate) return null
    const date = new Date(task.dueDate)
    if (isToday(date)) return { color: 'text-yellow-400 bg-yellow-500/15', text: 'Today' }
    if (isPast(date)) return { color: 'text-red-400 bg-red-500/15', text: format(date, 'MMM d') }
    return { color: 'text-slate-400 bg-slate-700/60', text: format(date, 'MMM d') }
  }

  const due = dueDateStatus()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-3 cursor-pointer transition-all duration-150 hover:shadow-md animate-scale-in ${isDragging ? 'shadow-2xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Labels row */}
          {(label || task.priority !== 'medium') && (
            <div className="flex flex-wrap gap-1 mb-2">
              {label && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${label.color}`}>
                  <Tag size={9} />
                  {label.label}
                </span>
              )}
              {task.priority && task.priority !== 'medium' && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priority.color} ${priority.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
              )}
            </div>
          )}

          <p className="text-sm font-medium text-slate-200 leading-snug">{task.title}</p>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {due && (
            <div className={`inline-flex items-center gap-1 text-xs mt-2 px-2 py-0.5 rounded-full ${due.color}`}>
              <Calendar size={10} />
              {due.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
