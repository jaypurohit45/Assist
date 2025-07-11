async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message, "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    console.log("Received:", data);

    addMessage(data.reply || "No reply :(", "bot");
  } catch (e) {
    console.error("❌ Fetch error:", e);
    addMessage("❌ Error connecting", "bot");
  }
}

function addMessage(sender, text, cls) {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = "msg " + cls;

  // Convert markdown to HTML using marked
  const formattedText = marked.parse(text);

  div.innerHTML = `<strong>${sender}:</strong><br>${formattedText}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
