const API_BASE = "http://127.0.0.1:8000";


/* =========================
   LOGIN ELEMENTS
========================= */

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const app = document.getElementById("app");


/* =========================
   SHOW APP
========================= */

function showApp() {
    loginScreen.style.display = "none";
    app.style.display = "flex";
}


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (!username || !password) {
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    loginError.style.display = "none";

    try {

        const formData = new FormData();

        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch(
            `${API_BASE}/login`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            loginError.textContent =
                data.message || "Username অথবা password ভুল।";

            loginError.style.display = "block";

            return;
        }

        showApp();

        loginUsername.value = "";
        loginPassword.value = "";

        renderChatList();

        if (currentChatId) {
            const existingChat = chats.find(
                chat => chat.id === currentChatId
            );

            if (existingChat) {
                openChat(currentChatId);
            }
        }

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Server-এর সাথে connection হচ্ছে না।";

        loginError.style.display = "block";

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

});
/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(
            `${API_BASE}/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (response.ok) {
            app.style.display = "none";
            loginScreen.style.display = "flex";

            loginUsername.value = "";
            loginPassword.value = "";

            conversationHistory = [];

            selectedImage = null;
            imageInput.value = "";
            previewImage.src = "";
            imagePreview.classList.remove("active");
        }

    } catch (error) {
        console.error("Logout failed:", error);
    }
});

/* =========================
   CHAT ELEMENTS
========================= */

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");

const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");
const removeImage = document.getElementById("removeImage");

const newChatBtn = document.getElementById("newChat");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");

const sendBtn = document.getElementById("sendBtn");
const chatList = document.getElementById("chatList");


/* =========================
   STATE
========================= */

let selectedImage = null;

let chats = JSON.parse(
    localStorage.getItem("personalAI_chats") || "[]"
);

let currentChatId = localStorage.getItem(
    "personalAI_currentChat"
);

let conversationHistory = [];


/* =========================
   SAVE CHATS
========================= */

function saveChats() {

    localStorage.setItem(
        "personalAI_chats",
        JSON.stringify(chats)
    );

    if (currentChatId) {

        localStorage.setItem(
            "personalAI_currentChat",
            currentChatId
        );

    }

}


/* =========================
   GENERATE CHAT ID
========================= */

function generateChatId() {

    return (
        Date.now().toString() +
        Math.random().toString(36).slice(2)
    );

}


/* =========================
   CREATE CHAT
========================= */

function createChat(firstMessage = "") {

    const chat = {

        id: generateChatId(),

        title:
            firstMessage
                ? firstMessage.slice(0, 35)
                : "New Chat",

        messages: []

    };

    chats.unshift(chat);

    currentChatId = chat.id;

    conversationHistory = [];

    saveChats();

    renderChatList();

    return chat;
}


/* =========================
   GET CURRENT CHAT
========================= */

function getCurrentChat() {

    return chats.find(
        chat => chat.id === currentChatId
    );

}


/* =========================
   RENDER CHAT LIST
========================= */

function renderChatList() {

    chatList.innerHTML = "";

    chats.forEach(chat => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "history-item" +
            (
                chat.id === currentChatId
                    ? " active"
                    : ""
            );

        button.textContent =
            chat.title || "New Chat";

        button.addEventListener(
            "click",
            () => {
                openChat(chat.id);
            }
        );

        chatList.appendChild(button);

    });

}


/* =========================
   OPEN CHAT
========================= */

function openChat(chatId) {

    const chat = chats.find(
        item => item.id === chatId
    );

    if (!chat) {
        return;
    }

    currentChatId = chat.id;

    conversationHistory = [];

    chat.messages.forEach(item => {

        conversationHistory.push({

            role: item.role,

            content: item.content

        });

    });

    renderMessages(chat);

    saveChats();

    renderChatList();

    if (window.innerWidth <= 700) {

        sidebar.classList.remove("open");

    }

}


/* =========================
   RENDER MESSAGES
========================= */

function renderMessages(chat) {

    messages.innerHTML = "";

    if (!chat || !chat.messages.length) {

        messages.innerHTML = `

            <div class="welcome" id="welcome">

                <div class="welcome-icon">
                    ✦
                </div>

                <h1>
                    How can I help you?
                </h1>

                <p>
                    তোমার প্রশ্ন লিখো অথবা একটি image upload করো।
                </p>

            </div>

        `;

        return;
    }

    chat.messages.forEach(item => {

        addMessage(
            item.role === "user"
                ? "user"
                : "ai",

            item.content,

            item.imageUrl || null,

            false
        );

    });

    scrollToBottom();

}


/* =========================
   IMAGE UPLOAD
========================= */

uploadBtn.addEventListener(
    "click",
    () => {
        imageInput.click();
    }
);


imageInput.addEventListener(
    "change",
    () => {

        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            alert("Please select an image.");

            imageInput.value = "";

            return;
        }

        selectedImage = file;

        const reader = new FileReader();

        reader.onload = event => {

            previewImage.src =
                event.target.result;

            imagePreview.classList.add("active");

        };

        reader.readAsDataURL(file);

    }
);


/* =========================
   REMOVE IMAGE
========================= */

removeImage.addEventListener(
    "click",
    () => {

        selectedImage = null;

        imageInput.value = "";

        previewImage.src = "";

        imagePreview.classList.remove("active");

    }
);


/* =========================
   ADD MESSAGE
========================= */

function addMessage(
    type,
    text,
    imageUrl = null,
    shouldScroll = true
) {

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    const message =
        document.createElement("div");

    message.className =
        `message ${
            type === "user"
                ? "user-message"
                : "ai-message"
        }`;

    const avatar =
        type === "user"
            ? "You"
            : "AI";

    message.innerHTML = `

        <div class="avatar">
            ${avatar}
        </div>

        <div class="message-content">

            <div class="message-name">

                ${
                    type === "user"
                        ? "You"
                        : "Personal AI"
                }

            </div>

            <div class="message-text"></div>

        </div>

    `;

    const textElement =
        message.querySelector(".message-text");

    if (text) {
        textElement.textContent = text;
    }

    if (imageUrl) {

        const img =
            document.createElement("img");

        img.src = imageUrl;

        img.className = "chat-image";

        img.alt = "Uploaded image";

        message
            .querySelector(".message-content")
            .appendChild(img);

    }

    messages.appendChild(message);

    if (shouldScroll) {
        scrollToBottom();
    }

    return message;
}


/* =========================
   LOADING MESSAGE
========================= */

function addLoadingMessage() {

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    const message =
        document.createElement("div");

    message.className =
        "message ai-message";

    message.innerHTML = `

        <div class="avatar">
            AI
        </div>

        <div class="message-content">

            <div class="message-name">
                Personal AI
            </div>

            <div class="message-text typing">
                Thinking
            </div>

        </div>

    `;

    messages.appendChild(message);

    scrollToBottom();

    return message;
}


/* =========================
   SAVE MESSAGE
========================= */

function saveMessage(
    role,
    content,
    imageUrl = null
) {

    const chat =
        getCurrentChat();

    if (!chat) {
        return;
    }

    chat.messages.push({

        role: role,

        content: content,

        imageUrl: imageUrl

    });

    if (chat.messages.length > 60) {

        chat.messages =
            chat.messages.slice(-60);

    }

    saveChats();

    renderChatList();

}


/* =========================
   SEND CHAT
========================= */

chatForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const message =
            messageInput.value.trim();

        if (!message && !selectedImage) {
            return;
        }

        sendBtn.disabled = true;

        const imageToSend =
            selectedImage;

        let imageUrl = null;

        if (imageToSend) {

            imageUrl =
                URL.createObjectURL(
                    imageToSend
                );

        }

        if (!currentChatId) {

            createChat(
                message || "Image Chat"
            );

        }

        const chat =
            getCurrentChat();

        if (
            chat &&
            chat.messages.length === 0
        ) {

            chat.title =
                message
                    ? message.slice(0, 35)
                    : "Image Chat";

        }

        addMessage(
            "user",
            message || "Image uploaded",
            imageUrl
        );

        saveMessage(
            "user",
            message || "Image uploaded",
            imageUrl
        );

        conversationHistory.push({

            role: "user",

            content:
                message ||
                "Image uploaded"

        });

        messageInput.value = "";

        messageInput.style.height =
            "auto";

        const loadingMessage =
            addLoadingMessage();

        try {

            let response;

            /* =========================
               IMAGE REQUEST
            ========================= */

            if (imageToSend) {

                const formData =
                    new FormData();

                formData.append(
                    "message",
                    message
                );

                formData.append(
                    "image",
                    imageToSend
                );

                formData.append(
                    "history",
                    JSON.stringify(
                        conversationHistory.slice(0, -1)
                    )
                );

                response = await fetch(
                    `${API_BASE}/chat-image`,
                    {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    }
                );

            }

            /* =========================
               TEXT REQUEST
            ========================= */

            else {

                const formData =
                    new FormData();

                formData.append(
                    "message",
                    message
                );

                formData.append(
                    "history",
                    JSON.stringify(
                        conversationHistory.slice(0, -1)
                    )
                );

                response = await fetch(
                    `${API_BASE}/chat`,
                    {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    }
                );

            }

            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }

            const data =
                await response.json();

            loadingMessage.remove();

            const aiReply =
                data.reply ||
                "No response received.";

            addMessage(
                "ai",
                aiReply
            );

            saveMessage(
                "assistant",
                aiReply
            );

            conversationHistory.push({

                role: "assistant",

                content: aiReply

            });

            saveChats();

        } catch (error) {

            console.error(error);

            loadingMessage.remove();

            addMessage(
                "ai",
                "Connection error. Please check that the AI server is running."
            );

        } finally {

            sendBtn.disabled = false;

            selectedImage = null;

            imageInput.value = "";

            previewImage.src = "";

            imagePreview.classList.remove("active");

            messageInput.focus();

        }

    }
);


/* =========================
   ENTER TO SEND
========================= */

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            chatForm.requestSubmit();

        }

    }
);


/* =========================
   AUTO RESIZE
========================= */

messageInput.addEventListener(
    "input",
    () => {

        messageInput.style.height =
            "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                150
            ) + "px";

    }
);


/* =========================
   NEW CHAT
========================= */

newChatBtn.addEventListener(
    "click",
    () => {

        createChat("New Chat");

        const chat =
            getCurrentChat();

        if (chat) {

            chat.title =
                "New Chat";

            chat.messages = [];

        }

        conversationHistory = [];

        renderMessages(chat);

        selectedImage = null;

        imageInput.value = "";

        previewImage.src = "";

        imagePreview.classList.remove("active");

        messageInput.value = "";

        messageInput.style.height =
            "auto";

        saveChats();

        renderChatList();

        messageInput.focus();

    }
);


/* =========================
   MOBILE SIDEBAR
========================= */

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


/* =========================
   CLOSE MOBILE SIDEBAR
========================= */

messages.addEventListener(
    "click",
    () => {

        if (window.innerWidth <= 700) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    setTimeout(
        () => {

            messages.scrollTo({

                top:
                    messages.scrollHeight,

                behavior:
                    "smooth"

            });

        },
        50
    );

}


/* =========================
   CHECK EXISTING SESSION
========================= */

async function checkSession() {

    try {

        const response =
            await fetch(
                `${API_BASE}/check-session`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {

            loginScreen.style.display = "flex";
            app.style.display = "none";

            return false;
        }

        const data =
            await response.json();

        if (data.logged_in) {

            showApp();

            return true;

        }

        loginScreen.style.display = "flex";
        app.style.display = "none";

        return false;

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

        loginScreen.style.display = "flex";
        app.style.display = "none";

        return false;
    }

}


/* =========================
   INITIALIZE APP
========================= */

async function initializeApp() {

    app.style.display = "none";

    loginScreen.style.display = "flex";

    renderChatList();

    const loggedIn =
        await checkSession();

    if (!loggedIn) {
        return;
    }

    if (currentChatId) {

        const existingChat =
            chats.find(
                chat =>
                    chat.id === currentChatId
            );

        if (existingChat) {

            conversationHistory =
                existingChat.messages.map(
                    item => ({

                        role: item.role,

                        content: item.content

                    })
                );

            renderMessages(existingChat);

            renderChatList();

        }

    }

}


/* =========================
   START APP
========================= */

initializeApp();