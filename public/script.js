let selectedImageFile = null; 
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  // Handle image message first
  if (selectedImageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      addMessage("You", `<img src="${imageData}" style="max-width:200px; border-radius:8px;" />`, "user");

    };
    reader.readAsDataURL(selectedImageFile);

    selectedImageFile = null;
    input.value = ""; 
    return;
  }

  // Handle normal text message
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
    addMessage(data.reply || "No reply :(", "bot");
  } catch (e) {
    console.error("❌ Fetch error:", e);
    addMessage("❌ Error connecting", "bot");
  }
}

const uploadBtn = document.getElementById("uploadBtn");
const uploadMenu = document.getElementById("uploadMenu");

uploadBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent menu from closing immediately
  uploadMenu.style.display = uploadMenu.style.display === "flex" ? "none" : "flex";
});
document.addEventListener("click", () => {
  uploadMenu.style.display = "none";
});
const textOption = document.getElementById("uploadTextOption");
const imageOption = document.getElementById("uploadImageOption");
const fileInput = document.getElementById("fileInput");
const imageInput = document.getElementById("imageInput");

// Text file trigger
textOption.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent document click from closing menu
  uploadMenu.style.display = "none";
  fileInput.click(); // open file picker
});

// Image file trigger
imageOption.addEventListener("click", (e) => {
  e.stopPropagation();
  uploadMenu.style.display = "none";
  imageInput.click();
});
imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.type.startsWith("image/")) {
    selectedImageFile = file;

    // Show "Image selected" in input
    const input = document.getElementById("userInput");
    input.value = "📷 Image selected. Ready to send.";
  }
});

document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileText = e.target.result;

      // Simulate typing fileText into input field
      const input = document.getElementById("userInput");
      input.value = fileText;
      // sendMessage();
      document.getElementById("fileInput").value = "";
    };

    reader.readAsText(file);
  }
});

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
