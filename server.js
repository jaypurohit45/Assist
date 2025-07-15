require("dotenv").config(); // ⬅️ Must be at the top

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

const API_KEY = process.env.GEMINI_API_KEY; // ⬅ Use from .env file
const genAI = new GoogleGenerativeAI(API_KEY);


// You can re-enable this line with the correct model name
// once you successfully get the list from /list-models.
// For now, let's keep it commented or set to a known test model if you prefer.
let chatModel; // Declare it here

app.use(cors());
//  FIX: Use Express's built-in JSON body parser
app.use(express.json());
// If you're also dealing with form submissions (not just JSON), you might add:
// app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));

// === CORRECTED ROUTE TO LIST MODELS ===
app.get("/list-models", async (req, res) => {
  try {
    //  FIX: Use genAI.models.list()
    const models = await genAI.models.list();
    const availableModels = [];
    for await (const model of models) {
      if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
        availableModels.push({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          inputTokenLimit: model.inputTokenLimit,
          outputTokenLimit: model.outputTokenLimit,
        });
      }
    }
    console.log(" Available models supporting generateContent:");
    console.log(JSON.stringify(availableModels, null, 2));

    // Once you successfully list models, you can programmatically pick one here
    // For now, it's just logging. You'll set chatModel globally after.

    res.json(availableModels);
  } catch (err) {
    console.error(" Error listing models:", err);
    res.status(500).json({ error: "Failed to list models", details: err.message });
  }
});
// =================================

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  console.log(" Received user message:", userMessage);

  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({ reply: "Please provide a message.", error: "Empty message" });
  }

  // Temporary initialization if chatModel isn't set globally yet.
  // This will ensure /chat works even if you haven't picked a model from /list-models yet.
  // In a final setup, 'chatModel' should be initialized globally.
  if (!chatModel) {
    // Try to default to a commonly available model like gemini-1.5-flash
    console.warn("❗ chatModel not globally initialized. Attempting to use 'models/gemini-1.5-flash' as default for this request.");
    try {
      chatModel = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    } catch (e) {
      console.error("Failed to initialize default model:", e);
      return res.status(500).json({ reply: "Server error: Default model could not be initialized.", error: e.message });
    }
  }


  try {
    const result = await chatModel.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    console.log("✅ Gemini replied:", text);
    res.json({ reply: text });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ reply: "No reply :(", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});