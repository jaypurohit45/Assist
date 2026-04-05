require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const GROQ_KEY = process.env.GROQ_API_KEY;

if (!GROQ_KEY) {
  console.error("❌ GROQ_API_KEY is missing from .env file!");
  process.exit(1);
}

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B",  description: "Most capable",  provider: "groq" },
  { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B",   description: "Fastest",        provider: "groq" },
  { id: "mixtral-8x7b-32768",      name: "Mixtral 8x7B",   description: "Long context",   provider: "groq" },
  { id: "gemma2-9b-it",            name: "Gemma 2 9B",     description: "Google model",   provider: "groq" },
  { id: "llama3-70b-8192",         name: "Llama 3 70B",    description: "Balanced",       provider: "groq" },
  { id: "llama3-8b-8192",          name: "Llama 3 8B",     description: "Lightweight",    provider: "groq" },
]

const MODE_PROMPTS = {
  general: `You are Assist, a helpful and knowledgeable AI assistant.
Be concise, clear, accurate and friendly.
Format code in proper markdown code blocks with language labels.
Use markdown formatting for structured responses when helpful.`,

  guide: `You are Assist in Guiding Mode.
Your role is to guide the user step by step through problems and decisions.
- Break complex problems into small numbered steps
- Ask one clarifying question at a time when needed
- Be encouraging and patient
- Always end your response with what the next step is`,

  learn: `You are Assist in Learning Mode — a patient and skilled teacher.
- Start with a simple explanation before going deeper
- Use real world analogies and examples
- After explaining something, ask the user one question to test understanding
- Give positive feedback when user answers correctly
- Summarize key points at the end`,

  code: `You are Assist in Coding Mode — an expert software engineer.
- Write clean, well commented, production ready code
- Always label code blocks with the programming language
- Explain what the code does after writing it
- Suggest optimizations and best practices
- Help debug by explaining the root cause of errors
- Support all languages: Python, JavaScript, TypeScript, Java, C++, Go, etc.`,

  reason: `You are Assist in Reasoning Mode — a critical thinking expert.
- Break down every argument step by step
- Identify assumptions and logical gaps
- Present multiple perspectives before concluding
- Use structured thinking: observation → analysis → conclusion
- Be objective and evidence based`,
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile"

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  methods: ["GET", "POST"],
}))
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Assist backend running 🚀" })
})

app.get("/models", (req, res) => {
  res.json({ models: MODELS })
})

app.post("/chat", async (req, res) => {
  // Accept either full history array OR single message string
  const { message, messages, model: requestedModel, mode } = req.body

  if (!message && (!messages || messages.length === 0)) {
    return res.status(400).json({ reply: "Please provide a message." })
  }

  const modelId = MODELS.find((m) => m.id === requestedModel)?.id || DEFAULT_MODEL
  const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.general

  // Build messages array for Groq
  // If full history passed → use it, else fall back to single message
  let chatMessages = []
  if (messages && messages.length > 0) {
    // Map our internal format to OpenAI format
    chatMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => !m.isError) // don't send error messages to AI
      .map((m) => ({
        role: m.role,
        content: m.text || '',
      }))
  } else {
    chatMessages = [{ role: "user", content: message }]
  }

  // Safety check
  if (chatMessages.length === 0) {
    return res.status(400).json({ reply: "No valid messages to send." })
  }

  console.log(`📩 [${modelId}/${mode || 'general'}] messages: ${chatMessages.length}`)

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`
      console.error("❌ Groq error:", errMsg)
      if (response.status === 401) return res.status(500).json({ reply: "Invalid Groq API key. Check your .env file." })
      if (response.status === 429) return res.status(500).json({ reply: "Rate limit reached. Please wait a moment and try again." })
      return res.status(500).json({ reply: "Groq API error: " + errMsg })
    }

    const text = data?.choices?.[0]?.message?.content
    if (!text) {
      console.error("❌ Empty response from Groq")
      return res.status(500).json({ reply: "No response from AI. Please try again." })
    }

    console.log("✅ Replied OK —", text.slice(0, 60))
    return res.json({ reply: text, model: modelId })

  } catch (err) {
    console.error("❌ Fetch error:", err.message)
    return res.status(500).json({ reply: "Cannot reach Groq. Check your internet connection." })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("🚀 Server running at http://localhost:" + PORT)
  console.log("🔑 Groq key:", `${GROQ_KEY.slice(0, 8)}...`)
  console.log("🤖 Default model:", DEFAULT_MODEL)
})