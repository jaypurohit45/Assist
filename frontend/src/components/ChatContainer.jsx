import { AnimatePresence, motion } from 'framer-motion'
import MessageBubble from './MessageBubble.jsx'
import Loader from './Loader.jsx'
import { Sparkles } from 'lucide-react'

const WELCOME_PROMPTS = [
  'Explain quantum computing simply',
  'Write a Python web scraper',
  'Help me debug my code',
  'Summarize this article for me',
]

export default function ChatContainer({ messages, isLoading, bottomRef, onSend }) {
  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto">
      {isEmpty ? (
        <WelcomeScreen onSend={onSend} />
      ) : (
        <div className="max-w-3xl mx-auto py-6 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 px-4 mb-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-accent/20">
                A
              </div>
              <div className="bg-surface-card border border-surface-border rounded-2xl rounded-bl-sm">
                <Loader />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>
      )}
    </div>
  )
}

function WelcomeScreen({ onSend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full px-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
        className="relative mb-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/30">
          <Sparkles size={28} className="text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl -z-10 scale-150" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-white mb-2"
      >
        How can I help you today?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-sm mb-10 max-w-sm"
      >
        Ask me anything — code, writing, analysis, or just a conversation.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg"
      >
        {WELCOME_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.07 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend({ text: prompt, imageDataUrl: null })}
            className="text-left px-4 py-3 bg-surface-card border border-surface-border rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-all duration-150"
          >
            {prompt}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
