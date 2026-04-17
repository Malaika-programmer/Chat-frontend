// Chat functionality
// const configuredSocketUrl = window.APP_CONFIG && window.APP_CONFIG.SOCKET_SERVER_URL;
// const isLocalhost =
//     window.location.hostname === 'localhost' ||
//     window.location.hostname === '127.0.0.1';

// const socketUrl =
//     configuredSocketUrl && !configuredSocketUrl.includes('your-railway-domain')
//         ? configuredSocketUrl
//         : isLocalhost
//             ? 'http://localhost:3000'
//             : null;

// if (!socketUrl) {
//     throw new Error(
//         'SOCKET_SERVER_URL is missing. Set the Railway backend URL in public/config.js before deploying the frontend.'
//     );
// }
const socket = io("https://chat-backend-production.up.railway.app", {
  transports: ["websocket", "polling"],
});
const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
});
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");
const sendBtn = document.getElementById("sendBtn");
const createRoomBtn = document.getElementById("createRoomBtn");
const createRoomModal = document.getElementById("createRoomModal");
const createRoomForm = document.getElementById("createRoomForm");
const closeModal = document.querySelector(".close-modal");
const cancelBtn = document.querySelector(".cancel-btn");
let currentRoom = "general";

// Initialize chat
document.addEventListener("DOMContentLoaded", () => {
  // Join default room
  socket.emit("join room", currentRoom);

  // Update online count
  updateOnlineCount();
});

// Handle room switching
document.querySelectorAll(".room-item").forEach((item) => {
  item.addEventListener("click", () => {
    const roomName = item.dataset.room;

    // Update active room
    document
      .querySelectorAll(".room-item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    // Leave current room and join new one
    socket.emit("leave room", currentRoom);
    currentRoom = roomName;
    socket.emit("join room", currentRoom);

    // Update UI
    document.getElementById("currentRoom").textContent =
      roomName.charAt(0).toUpperCase() + roomName.slice(1);
    clearMessages();
  });
});

// Handle message sending
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    // Emit message to current room
    socket.emit("chat message", { message, room: currentRoom });
    messageInput.value = "";
  }
});

// Handle incoming messages
socket.on("chat message", (data) => {
  const { message, user, timestamp, room } = data;
  if (room === currentRoom) {
    addMessage(message, user, timestamp, false);
  }
});

// Handle room messages (for when joining a room)
socket.on("room message", (messages) => {
  clearMessages();
  messages.forEach((msg) => {
    addMessage(msg.message, msg.user, msg.timestamp, msg.user === "You");
  });
});

// Handle user joined/left
socket.on("user joined", (data) => {
  const { user, room } = data;
  if (room === currentRoom) {
    addSystemMessage(`${user} joined the room`);
    updateOnlineCount();
  }
});

socket.on("user left", (data) => {
  const { user, room } = data;
  if (room === currentRoom) {
    addSystemMessage(`${user} left the room`);
    updateOnlineCount();
  }
});

// Modal functionality
createRoomBtn.addEventListener("click", () => {
  createRoomModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  createRoomModal.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
  createRoomModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === createRoomModal) {
    createRoomModal.style.display = "none";
  }
});

// Handle create room form
createRoomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomName = document.getElementById("roomName").value.trim();
  const roomDescription = document
    .getElementById("roomDescription")
    .value.trim();

  if (roomName) {
    socket.emit("create room", {
      name: roomName,
      description: roomDescription,
    });
    createRoomModal.style.display = "none";
    createRoomForm.reset();
  }
});

// Handle new room created
socket.on("room created", (roomData) => {
  addRoomToList(roomData);
});

// Typing indicator
let typingTimer;
messageInput.addEventListener("input", () => {
  clearTimeout(typingTimer);
  socket.emit("typing", { room: currentRoom, isTyping: true });

  typingTimer = setTimeout(() => {
    socket.emit("typing", { room: currentRoom, isTyping: false });
  }, 1000);
});

socket.on("user typing", (data) => {
  const { user, room, isTyping } = data;
  if (room === currentRoom && user !== "You") {
    showTypingIndicator(user, isTyping);
  }
});

// Helper functions
function addMessage(message, user, timestamp, isSent) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isSent ? "sent" : "received"}`;

  const avatar = user.charAt(0).toUpperCase();
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${user}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${message}</div>
        </div>
    `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function addSystemMessage(message) {
  const systemDiv = document.createElement("div");
  systemDiv.className = "message system";
  systemDiv.innerHTML = `
        <div class="message-content system-message">
            <div class="message-text">${message}</div>
        </div>
    `;

  messagesContainer.appendChild(systemDiv);
  scrollToBottom();
}

function clearMessages() {
  messagesContainer.innerHTML = "";
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateOnlineCount() {
  // This would typically come from the server
  // For now, just show a static count
  document.querySelector(".online-count").textContent = "42 online";
}

function addRoomToList(roomData) {
  const roomsList = document.querySelector(".rooms-list");
  const roomItem = document.createElement("div");
  roomItem.className = "room-item";
  roomItem.dataset.room = roomData.name;

  roomItem.innerHTML = `
        <div class="room-icon">💬</div>
        <div class="room-info">
            <div class="room-name">${roomData.name}</div>
            <div class="room-members">1 member</div>
        </div>
    `;

  roomItem.addEventListener("click", () => {
    document
      .querySelectorAll(".room-item")
      .forEach((i) => i.classList.remove("active"));
    roomItem.classList.add("active");

    socket.emit("leave room", currentRoom);
    currentRoom = roomData.name;
    socket.emit("join room", currentRoom);

    document.getElementById("currentRoom").textContent = roomData.name;
    clearMessages();
  });

  roomsList.appendChild(roomItem);
}

function showTypingIndicator(user, isTyping) {
  let typingIndicator = document.querySelector(".typing-indicator");

  if (isTyping) {
    if (!typingIndicator) {
      typingIndicator = document.createElement("div");
      typingIndicator.className = "typing-indicator";
      typingIndicator.innerHTML = `
                <div class="message-content system-message">
                    <div class="message-text">${user} is typing...</div>
                </div>
            `;
      messagesContainer.appendChild(typingIndicator);
    }
  } else {
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// Emoji button functionality
document.getElementById("emojiBtn").addEventListener("click", () => {
  // Simple emoji picker - in a real app, you'd use a proper emoji picker library
  const emojis = ["😊", "😂", "❤️", "👍", "👋", "🎉", "🔥", "💯"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  messageInput.value += emoji;
  messageInput.focus();
});

// Enter key to send
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    messageForm.dispatchEvent(new Event("submit"));
  }
});
