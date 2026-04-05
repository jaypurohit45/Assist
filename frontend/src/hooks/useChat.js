import { useState, useCallback, useRef, useEffect } from 'react'
import { sendChatMessage } from '../utils/api.js'

const STORAGE_KEY = 'assist_chat_sessions'
const MAX_SESSIONS = 30

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {}
}

function generateTitle(text) {
  const clean = text.trim().replace(/\n+/g, ' ')
  return clean.length > 42 ? clean.slice(0, 42) + '…' : clean
}

function createSession() {
  return {
    id: Date.now().toString(),
    title: 'New chat',
    messages: [],
    createdAt: Date.now(),
  }
}

export default function useChat() {
  const [sessions, setSessions] = useState(() => loadSessions())
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const s = loadSessions()
    return s.length > 0 ? s[0].id : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')
  const [selectedMode, setSelectedMode] = useState('general')
  const bottomRef = useRef(null)

  useEffect(() => { saveSessions(sessions) }, [sessions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessions, activeSessionId, isLoading])

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null
  const messages = activeSession?.messages ?? []

  const startNewSession = useCallback(() => {
    const session = createSession()
    setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS))
    setActiveSessionId(session.id)
  }, [])

  const switchSession = useCallback((id) => {
    setActiveSessionId(id)
  }, [])

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null)
      }
      return updated
    })
  }, [activeSessionId])

  // Rename a session title
  const renameSession = useCallback((id, newTitle) => {
    const clean = newTitle.trim()
    if (!clean) return
    setSessions((prev) =>
      prev.map((s) => s.id === id ? { ...s, title: clean } : s)
    )
  }, [])

  const sendMessage = useCallback(async ({ text, imageDataUrl }) => {
    // --- Create session if needed ---
    let sessionId = activeSessionId
    if (!sessionId) {
      const session = createSession()
      setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS))
      setActiveSessionId(session.id)
      sessionId = session.id
    }

    // --- Set title from first message ---
    const currentSession = sessions.find((s) => s.id === sessionId)
    const isFirstMessage = !currentSession || currentSession.messages.length === 0
    if (isFirstMessage && text) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, title: generateTitle(text) } : s
        )
      )
    }

    // --- Add user message ---
    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: text || '',
      imageDataUrl: imageDataUrl || null,
      timestamp: Date.now(),
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    )

    if (!text) return

    setIsLoading(true)

    try {
      // --- Build full history to send ---
      const existingMessages = currentSession?.messages || []
      const allMessages = [...existingMessages, userMsg]

      const reply = await sendChatMessage(allMessages, selectedModel, selectedMode)

      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
        mode: selectedMode,
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, botMsg] }
            : s
        )
      )

    } catch (err) {
      const errMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: err?.message || 'Something went wrong. Please try again.',
        timestamp: Date.now(),
        isError: true,
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, errMsg] }
            : s
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [activeSessionId, sessions, selectedModel, selectedMode])

  return {
    sessions,
    activeSession,
    messages,
    isLoading,
    bottomRef,
    selectedModel,
    setSelectedModel,
    selectedMode,
    setSelectedMode,
    startNewSession,
    switchSession,
    deleteSession,
    renameSession,
    sendMessage,
  }
}