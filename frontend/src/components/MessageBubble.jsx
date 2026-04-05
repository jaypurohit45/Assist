import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { Check, Copy, AlertTriangle } from 'lucide-react'

marked.setOptions({ breaks: true, gfm: true })

function renderMarkdown(text) {
  try {
    const renderer = new marked.Renderer()

    renderer.code = (code, lang) => {
      const safeCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
      return `
        <div class="code-wrapper">
          <div class="code-header">
            ${langLabel}
            <button class="copy-btn" data-code="${encodeURIComponent(code)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </button>
          </div>
          <pre><code>${safeCode}</code></pre>
        </div>
      `
    }

    return marked.parse(text, { renderer })
  } catch {
    // If markdown parsing fails, show as plain escaped text
    return `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
  }
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MessageBubble({ message }) {
  if (!message) return null

  const isUser = message.role === 'user'
  const isError = message.isError === true
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback((e) => {
    const btn = e.target.closest('.copy-btn')
    if (!btn) return
    try {
      const code = decodeURIComponent(btn.dataset.code)
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!
        `
        setTimeout(() => {
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          `
        }, 2000)
      })
    } catch { /* clipboard unavailable */ }
  }, [])

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.text || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [message.text])

  const renderedHtml = (!isUser && message.text) ? renderMarkdown(message.text) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-4 px-4`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-1 shadow-lg ${
          isError ? 'bg-red-600 shadow-red-900/30' : 'bg-accent shadow-accent/20'
        }`}>
          {isError ? <AlertTriangle size={14} /> : 'A'}
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%] min-w-0`}>

        {/* Image preview */}
        {message.imageDataUrl && (
          <div className="mb-2">
            <img
              src={message.imageDataUrl}
              alt="Uploaded"
              className="max-w-[260px] max-h-[260px] rounded-2xl object-cover border border-surface-border shadow-lg"
            />
          </div>
        )}

        {/* Message bubble */}
        {message.text && (
          isError ? (
            // Error bubble — always plain text, never crashes markdown parser
            <div className="flex items-start gap-2 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-red-950/60 text-red-300 border border-red-800/60">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{message.text}</span>
            </div>
          ) : isUser ? (
            // User bubble — plain text
            <div className="rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-surface-input text-white">
              {message.text}
            </div>
          ) : (
            // Assistant bubble — markdown rendered
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-surface-card text-gray-100 border border-surface-border"
              dangerouslySetInnerHTML={{ __html: `<div class="prose-chat">${renderedHtml}</div>` }}
              onClick={handleClick}
            />
          )
        )}

        {/* Timestamp + copy */}
        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[11px] text-gray-600">{formatTime(message.timestamp)}</span>
          {!isUser && !isError && message.text && (
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-accent transition-colors"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-input flex items-center justify-center text-gray-400 text-xs font-bold ml-3 mt-1">
          You
        </div>
      )}

      <style>{`
        .code-wrapper { margin: 0.5em 0; border-radius: 10px; overflow: hidden; border: 1px solid #2a2a2a; background: #0a0a0a; }
        .code-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: #111; border-bottom: 1px solid #2a2a2a; }
        .code-lang { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #10a37f; }
        .copy-btn { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #888; background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color 0.2s; font-family: 'DM Sans', sans-serif; }
        .copy-btn:hover { color: #10a37f; }
        .code-wrapper pre { margin: 0; background: transparent; border: none; }
        .code-wrapper pre code { display: block; padding: 14px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.82em; color: #e2e8f0; line-height: 1.7; }
      `}</style>
    </motion.div>
  )
}