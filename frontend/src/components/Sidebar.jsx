import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Sparkles, Pencil, Check, X } from 'lucide-react'

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  onRenameSession,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  const grouped = sessions.reduce((acc, s) => {
    const label = formatDate(s.createdAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(s)
    return acc
  }, {})

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-full bg-surface-card border-r border-surface-border overflow-hidden flex-shrink-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-surface-border flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="font-semibold text-sm text-white tracking-wide">Assist</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-accent hover:bg-accent/10 transition-all ml-auto"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-2 py-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewChat}
            className={`flex items-center gap-2 w-full rounded-xl text-sm font-medium transition-all text-accent hover:bg-accent/10 border border-accent/20 hover:border-accent/40 ${
              collapsed ? 'justify-center p-2' : 'px-3 py-2'
            }`}
          >
            <Plus size={16} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  New chat
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Sessions list expanded */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-600">
                No conversations yet
              </div>
            ) : (
              Object.entries(grouped).map(([label, group]) => (
                <div key={label} className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 px-2 py-1.5 font-medium">
                    {label}
                  </p>
                  {group.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      isHovered={hoveredId === session.id}
                      onHover={setHoveredId}
                      onSelect={() => onSwitchSession(session.id)}
                      onDelete={() => onDeleteSession(session.id)}
                      onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Sessions collapsed icons */}
        {collapsed && (
          <div className="flex-1 overflow-y-auto px-1.5 pb-3 no-scrollbar">
            {sessions.slice(0, 20).map((session) => (
              <button
                key={session.id}
                onClick={() => onSwitchSession(session.id)}
                title={session.title}
                className={`w-full flex items-center justify-center p-2 my-0.5 rounded-xl transition-colors ${
                  session.id === activeSessionId
                    ? 'bg-accent/15 text-accent'
                    : 'text-gray-600 hover:text-gray-300 hover:bg-surface-hover'
                }`}
              >
                <MessageSquare size={15} />
              </button>
            ))}
          </div>
        )}
      </motion.aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-white">Assist</span>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 rounded-lg px-2.5 py-1.5 hover:bg-accent/10 transition-colors"
        >
          <Plus size={13} /> New
        </button>
      </div>
    </>
  )
}

function SessionItem({ session, isActive, isHovered, onHover, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.title)
  const inputRef = useRef(null)

  const startEdit = (e) => {
    e.stopPropagation()
    setEditValue(session.title)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const confirmEdit = () => {
    if (editValue.trim()) onRename(editValue.trim())
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditValue(session.title)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirmEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div
      className={`relative flex items-center rounded-xl transition-all duration-150 my-0.5 ${
        isActive
          ? 'bg-accent/15 border border-accent/20'
          : 'hover:bg-surface-hover border border-transparent'
      }`}
      onMouseEnter={() => onHover(session.id)}
      onMouseLeave={() => onHover(null)}
    >
      {editing ? (
        // Inline rename input
        <div className="flex items-center gap-1 px-2 py-1.5 w-full">
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-surface-input text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-accent/40 min-w-0"
          />
          <button
            onClick={confirmEdit}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-accent hover:bg-accent/15 transition-colors flex-shrink-0"
          >
            <Check size={11} />
          </button>
          <button
            onClick={cancelEdit}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-500 hover:bg-surface-input transition-colors flex-shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={onSelect}
            onDoubleClick={startEdit}
            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left min-w-0"
            title="Double click to rename"
          >
            <MessageSquare
              size={13}
              className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-gray-600'}`}
            />
            <span className={`text-xs truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
              {session.title}
            </span>
          </button>

          <AnimatePresence>
            {(isHovered || isActive) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-0.5 pr-1.5 flex-shrink-0"
              >
                <button
                  onClick={startEdit}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600 hover:text-accent hover:bg-accent/15 transition-colors"
                  title="Rename"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}