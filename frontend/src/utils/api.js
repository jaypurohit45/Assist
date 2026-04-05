export async function sendChatMessage(messages, model, mode) {
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, mode }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.reply || `Server error ${res.status}`)
    }

    return data.reply ?? 'No reply received.'

  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on port 3000.')
    }
    throw err
  }
}

export async function fetchModels() {
  try {
    const res = await fetch('/models')
    const data = await res.json()
    return data.models || []
  } catch {
    return []
  }
}