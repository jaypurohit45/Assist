import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ImageIcon } from 'lucide-react'

export default function UploadMenu({ open, onClose, onFileText, onImageSelect }) {
  const menuRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleTextFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onFileText(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
    onClose()
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => onImageSelect(ev.target.result, file.name)
    reader.readAsDataURL(file)
    e.target.value = ''
    onClose()
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={handleTextFileChange} />
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full mb-3 left-0 z-50 bg-surface-card border border-surface-border rounded-2xl shadow-2xl shadow-black/60 p-2 min-w-[190px]"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-150 group"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-input group-hover:bg-accent/15 transition-colors">
                <FileText size={14} />
              </span>
              Upload Text File
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-150 group"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-input group-hover:bg-accent/15 transition-colors">
                <ImageIcon size={14} />
              </span>
              Upload Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
