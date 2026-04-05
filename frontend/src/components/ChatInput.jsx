import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, Mic, X, ImageIcon, ChevronDown, BookOpen, Code2, Brain, Lightbulb, MessageCircle } from 'lucide-react'
import UploadMenu from './UploadMenu.jsx'
import { fetchModels } from '../utils/api.js'

const FALLBACK_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B",  description: "Most capable",  provider: "groq" },
  { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B",   description: "Fastest",        provider: "groq" },
  { id: "mixtral-8x7b-32768",      name: "Mixtral 8x7B",   description: "Long context",   provider: "groq" },
  { id: "gemma2-9b-it",            name: "Gemma 2 9B",     description: "Google model",   provider: "groq" },
  { id: "llama3-70b-8192",         name: "Llama 3 70B",    description: "Balanced",       provider: "groq" },
  { id: "llama3-8b-8192",          name: "Llama 3 8B",     description: "Lightweight",    provider: "groq" },
]

const MODES = [
  { id: 'general', label: 'General', icon: MessageCircle, color: 'text-gray-300'  },
  { id: 'guide',   label: 'Guide',   icon: Lightbulb,     color: 'text-yellow-400'},
  { id: 'learn',   label: 'Learn',   icon: BookOpen,      color: 'text-blue-400'  },
  { id: 'code',    label: 'Code',    icon: Code2,         color: 'text-green-400' },
  { id: 'reason',  label: 'Reason',  icon: Brain,         color: 'text-purple-400'},
]

export default function ChatInput({ onSend, isLoading, selectedModel, onModelChange, selectedMode, onModeChange }) {
  const [text, setText] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [models, setModels] = useState(FALLBACK_MODELS)
  const textareaRef = useRef(null)
  const modelMenuRef = useRef(null)

  useEffect(() => {
    fetchModels().then((data) => { if (data.length > 0) setModels(data) })
  }, [])

  useEffect(() => {
    if (!modelOpen) return
    const handler = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) setModelOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [modelOpen])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && !pendingImage) return
    if (isLoading) return
    onSend({ text: trimmed, imageDataUrl: pendingImage?.dataUrl ?? null })
    setText('')
    setPendingImage(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, pendingImage, isLoading, onSend])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileText = useCallback((fileText) => {
    setText(fileText); setTimeout(autoResize, 0); textareaRef.current?.focus()
  }, [autoResize])

  const handleImageSelect = useCallback((dataUrl, name) => {
    setPendingImage({ dataUrl, name }); textareaRef.current?.focus()
  }, [])

  const canSend = (text.trim().length > 0 || pendingImage !== null) && !isLoading
  const activeModel = models.find((m) => m.id === selectedModel) || models[0]
  const activeMode = MODES.find((m) => m.id === selectedMode) || MODES[0]
  const ModeIcon = activeMode.icon

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">

        {/* Image preview */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-center gap-2 px-1"
            >
              <div className="relative group inline-flex">
                <img src={pendingImage.dataUrl} alt="Preview"
                  className="h-14 w-14 rounded-xl object-cover border border-surface-border" />
                <button onClick={() => setPendingImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-900 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 border border-surface-border">
                  <X size={10} />
                </button>
              </div>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                <ImageIcon size={11} className="inline mr-1 mb-0.5" />{pendingImage.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode tabs + Model selector row */}
        <div className="flex items-center gap-1 mb-2 px-1 overflow-x-auto no-scrollbar">
          {/* Mode tabs */}
          {MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = selectedMode === mode.id
            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onModeChange(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-surface-card border border-surface-border text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-400 border border-transparent hover:border-surface-border'
                }`}
              >
                <Icon size={12} className={isActive ? mode.color : ''} />
                {mode.label}
              </motion.button>
            )
          })}

          {/* Model selector — pushed to right */}
          <div className="ml-auto flex-shrink-0 relative" ref={modelMenuRef}>
            <button
              onClick={() => setModelOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent border border-surface-border hover:border-accent/40 rounded-lg px-2.5 py-1.5 bg-surface-card transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              {activeModel?.name || 'Model'}
              <ChevronDown size={11} className={`transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 right-0 z-50 bg-surface-card border border-surface-border rounded-2xl shadow-2xl shadow-black/60 p-1.5 min-w-[220px]"
                >
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 px-3 py-1.5 font-medium">
                    🆓 Groq — Free Models
                  </p>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => { onModelChange(model.id); setModelOpen(false) }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all group ${
                        selectedModel === model.id
                          ? 'bg-accent/15 text-accent'
                          : 'text-gray-300 hover:bg-surface-hover hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{model.name}</div>
                        {model.description && (
                          <div className="text-[11px] text-gray-500 group-hover:text-gray-400 mt-0.5">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent ml-2 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input bar */}
        <div className="relative flex items-end gap-2 bg-surface-card border border-surface-border rounded-2xl px-3 py-2.5 focus-within:border-accent/50 transition-all duration-200">
          <div className="relative flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={() => setUploadOpen((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                uploadOpen ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-accent hover:bg-accent/10'
              }`}
            >
              <Plus size={18} />
            </motion.button>
            <UploadMenu
              open={uploadOpen}
              onClose={() => setUploadOpen(false)}
              onFileText={handleFileText}
              onImageSelect={handleImageSelect}
            />
          </div>

          {/* Mode badge inside input */}
          <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-input text-xs ${activeMode.color}`}>
            <ModeIcon size={11} />
            <span className="hidden sm:inline text-[11px]">{activeMode.label}</span>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything in ${activeMode.label} mode…`}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-gray-600 leading-relaxed py-1 max-h-[180px] overflow-y-auto no-scrollbar"
          />

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Mic size={16} />
          </motion.button>

          <motion.button
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.93 } : {}}
            onClick={handleSend}
            disabled={!canSend}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
              canSend
                ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20'
                : 'bg-surface-input text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </motion.button>
        </div>

        <p className="text-center text-[11px] text-gray-700 mt-2">
          Assist can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}