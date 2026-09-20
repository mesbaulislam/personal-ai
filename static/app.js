/* =========================================================
   PERSONAL AI — V2.1 CLOUD HISTORY
   ========================================================= */

const API_BASE = "";


/* =========================================================
   LOGIN ELEMENTS
   ========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const loginForm =
    document.getElementById("loginForm");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const app =
    document.getElementById("app");


/* =========================================================
   CHAT ELEMENTS
   ========================================================= */

const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const messages =
    document.getElementById("messages");

const uploadBtn =
    document.getElementById("uploadBtn");

const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const previewImage =
    document.getElementById("previewImage");

const removeImage =
    document.getElementById("removeImage");

const newChatBtn =
    document.getElementById("newChat");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");

const sendBtn =
    document.getElementById("sendBtn");

const chatList =
    document.getElementById("chatList");


/* =========================================================
   STATE
   ========================================================= */

let selectedImage = null;

let chats = [];

let currentChatId =
    localStorage.getItem("personalAI_currentChat");

let conversationHistory = [];

let searchInput = null;

let editingMessageIndex = null;

let currentTheme =
    localStorage.getItem("personalAI_theme") ||
    "dark";


function applyTheme() {

    document.documentElement.setAttribute(
        "data-theme",
        currentTheme
    );

    localStorage.setItem(
        "personalAI_theme",
        currentTheme
    );
}


applyTheme();


const themeBtn =
    document.getElementById("themeBtn");


if (themeBtn) {

    themeBtn.textContent =
        currentTheme === "dark"
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";


    themeBtn.addEventListener(
        "click",
        () => {

            currentTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";

            applyTheme();

            themeBtn.textContent =
                currentTheme === "dark"
                    ? "🌙 Dark Mode"
                    : "☀️ Light Mode";
        }
    );
}


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function showApp() {

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }
}


function showLogin() {

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (app) {
        app.style.display = "none";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await apiRequest(
                    "/logout",
                    {
                        method: "POST"
                    }
                );

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );
            }

            showLogin();

            currentChatId = null;

            conversationHistory = [];

            localStorage.removeItem(
                "personalAI_currentChat"
            );
        }
    );
}
    if (app) {
        app.style.display = "none";
    }



function cacheChats() {
    try {
        const cleanChats = chats.map(chat => ({
            id: chat.id,
            title: chat.title,
            pinned: Number(chat.pinned) || 0,
            messages: (chat.messages || []).map(item => ({
                role: item.role,
                content: item.content
            }))
        }));

        localStorage.setItem(
            "personalAI_chats",
            JSON.stringify(cleanChats)
        );

        if (currentChatId !== null && currentChatId !== undefined) {
            localStorage.setItem(
                "personalAI_currentChat",
                String(currentChatId)
            );
        }
    } catch (error) {
        console.error(
            "Local cache error:",
            error
        );
    }
}


function loadLocalChats() {
    try {
        const raw =
            localStorage.getItem(
                "personalAI_chats"
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];
    } catch (error) {
        console.error(
            "Local chat read error:",
            error
        );

        return [];
    }
}


function getCurrentChat() {
    return chats.find(
        chat =>
            String(chat.id) ===
            String(currentChatId)
    );
}


function setCurrentChat(id) {
    currentChatId =
        id === null || id === undefined
            ? null
            : String(id);

    if (currentChatId === null) {
        localStorage.removeItem(
            "personalAI_currentChat"
        );
    } else {
        localStorage.setItem(
            "personalAI_currentChat",
            currentChatId
        );
    }
}


/* =========================================================
   API HELPER
   ========================================================= */

async function apiRequest(
    path,
    options = {}
) {
    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                credentials: "include",
                ...options
            }
        );

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {
        const message =
            data &&
            (
                data.detail ||
                data.message
            )
                ? (
                    data.detail ||
                    data.message
                )
                : `Server error: ${response.status}`;

        const error =
            new Error(message);

        error.status =
            response.status;

        throw error;
    }

    return data;
}


function makeFormData(values) {
    const formData =
        new FormData();

    Object.entries(values).forEach(
        ([key, value]) => {
            formData.append(
                key,
                value
            );
        }
    );

    return formData;
}


/* =========================================================
   DYNAMIC SIDEBAR UI
   ========================================================= */

function injectChatUIStyles() {
    if (
        document.getElementById(
            "personal-ai-v21-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "personal-ai-v21-styles";

    style.textContent = `
        .v21-chat-tools {
            display: flex;
            gap: 6px;
            margin: 8px 0;
        }

        .v21-chat-search {
            width: 100%;
            box-sizing: border-box;
            padding: 9px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.06);
            color: inherit;
            outline: none;
        }

        .v21-chat-search::placeholder {
            opacity: 0.6;
        }

        .v21-cloud-status {
            font-size: 11px;
            opacity: 0.65;
            padding: 2px 2px 7px;
        }

        .v21-chat-row {
            display: flex;
            align-items: stretch;
            gap: 4px;
            margin-bottom: 4px;
        }

        .v21-chat-row .history-item {
            flex: 1;
            min-width: 0;
        }

        .v21-chat-actions {
            display: flex;
            align-items: center;
            gap: 2px;
        }

        .v21-chat-action {
            border: 0;
            background: transparent;
            color: inherit;
            opacity: 0.6;
            cursor: pointer;
            border-radius: 6px;
            padding: 5px 6px;
            font-size: 12px;
        }

        .v21-chat-action:hover {
            opacity: 1;
            background: rgba(255,255,255,0.08);
        }

        .v21-empty-history {
            opacity: 0.55;
            font-size: 13px;
            text-align: center;
            padding: 14px 8px;
        }

        .copy-message-btn {
            margin-top: 8px;
            padding: 5px 9px;

            border: 0;
            border-radius: 7px;

            background: rgba(255,255,255,0.07);
            color: inherit;

            font-size: 12px;
            cursor: pointer;

            opacity: 0.65;
            transition: 0.2s ease;
        }

        .copy-message-btn:hover {
            opacity: 1;
            background: rgba(255,255,255,0.12);
        }
        .ai-message-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
        }

        .ai-message-actions button {
            margin-top: 0;
        }

        .regenerate-message-btn {
            padding: 5px 9px;
            border: 0;
            border-radius: 7px;
            background: rgba(255,255,255,0.07);
            color: inherit;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.65;
            transition: 0.2s ease;
        }

        .regenerate-message-btn:hover {
            opacity: 1;
            background: rgba(255,255,255,0.12);
        }

        .regenerate-message-btn:disabled,
        .copy-message-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        @media (max-width: 700px) {
            .regenerate-message-btn {
                padding: 7px 10px;
                font-size: 12px;
            }
        }
        @media (max-width: 700px) {
            .copy-message-btn {
                padding: 7px 10px;
                font-size: 12px;
            }
                }
        
        /* Thinking animation */
        .thinking-dots {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            height: 18px;
        }

        .thinking-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0.35;
            animation: thinkingDot 1.2s infinite ease-in-out;
        }

        .thinking-dots span:nth-child(1) {
            animation-delay: 0s;
        }

        .thinking-dots span:nth-child(2) {
            animation-delay: 0.15s;
        }

        .thinking-dots span:nth-child(3) {
            animation-delay: 0.3s;
        }

        @keyframes thinkingDot {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.3;
            }

            30% {
                transform: translateY(-4px);
                opacity: 1;
            }
        }


        /* Mobile sidebar polish */
        @media (max-width: 700px) {

            .sidebar {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                bottom: 0 !important;

                width: min(84vw, 320px) !important;
                max-width: 320px !important;

                transform: translateX(-105%) !important;
                transition: transform 0.25s ease !important;

                z-index: 1001 !important;

                box-shadow:
                    12px 0 35px rgba(0,0,0,0.22);
            }

            .sidebar.open {
                transform: translateX(0) !important;
            }

            .personal-ai-mobile-overlay {
                position: fixed;
                inset: 0;

                background: rgba(0,0,0,0.38);

                backdrop-filter: blur(2px);
                -webkit-backdrop-filter: blur(2px);

                opacity: 0;
                pointer-events: none;

                transition: opacity 0.25s ease;

                z-index: 1000;
            }

            .personal-ai-mobile-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            body.personal-ai-sidebar-open {
                overflow: hidden;
                touch-action: none;
            }

            .v21-chat-search {
                padding: 11px 12px;
                font-size: 14px;
            }

            .v21-chat-action {
                min-width: 34px;
                min-height: 34px;

                padding: 7px;
                font-size: 13px;
            }

            .v21-chat-row {
                gap: 6px;
            }
            .chat-image {
                max-width: 100%;
                max-height: 380px;
                border-radius: 12px;
            }

            .image-preview img {
                width: 100px;
                height: 100px;
            }
        `;

        document.head.appendChild(style);
    }

function setupChatTools() {
    injectChatUIStyles();

    if (!chatList) {
        return;
    }

    const parent =
        chatList.parentElement;

    if (!parent) {
        return;
    }

    if (
        document.getElementById(
            "v21-chat-tools"
        )
    ) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "v21-chat-tools";

    wrapper.className =
        "v21-chat-tools";

    const tools =
        document.createElement("div");

    tools.id =
        "v21-chat-tools-inner";

    const status =
        document.createElement("div");

    status.className =
        "v21-cloud-status";

    status.textContent =
        "☁️ Cloud history";

    searchInput =
        document.createElement("input");

    searchInput.className =
        "v21-chat-search";

    searchInput.placeholder =
        "Search chats...";

    searchInput.type =
        "search";

    searchInput.autocomplete =
        "off";

    tools.appendChild(
        searchInput
    );

    wrapper.appendChild(
        status
    );

    wrapper.appendChild(
        tools
    );

    parent.insertBefore(
        wrapper,
        chatList
    );

    let searchTimer = null;

    searchInput.addEventListener(
        "input",
        () => {
            clearTimeout(searchTimer);

            searchTimer =
                setTimeout(
                    () => {
                        searchChats(
                            searchInput.value
                        );
                    },
                    250
                );
        }
    );
}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const username =
                loginUsername.value.trim();

            const password =
                loginPassword.value;

            if (!username || !password) {
                return;
            }

            loginBtn.disabled =
                true;

            loginBtn.textContent =
                "Logging in...";

            loginError.style.display =
                "none";

            try {

                const formData =
                    makeFormData({
                        username,
                        password
                    });

                const data =
                    await apiRequest(
                        "/login",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                if (!data.success) {
                    throw new Error(
                        data.message ||
                        "Login failed"
                    );
                }

                showApp();

                loginUsername.value =
                    "";

                loginPassword.value =
                    "";

                await loadCloudChats();

            } catch (error) {

                console.error(error);

                loginError.textContent =
                    error.message ||
                    "Server-এর সাথে connection হচ্ছে না।";

                loginError.style.display =
                    "block";

            } finally {

                loginBtn.disabled =
                    false;

                loginBtn.textContent =
                    "Login";
            }
        }
    );
}


/* =========================================================
   CLOUD CHAT LOAD
   ========================================================= */

async function loadCloudChats() {

    try {

        const data =
            await apiRequest(
                "/chats"
            );

        chats =
            Array.isArray(data.chats)
                ? data.chats.map(chat => ({
                    id: chat.id,
                    title:
                        chat.title ||
                        "New Chat",
                    pinned:
                        Number(chat.pinned) || 0,
                    messages: []
                }))
                : [];

        cacheChats();

        renderChatList();

        /*
         * V1 local history migration.
         * Only migrate when D1 is empty.
         */
        if (
            chats.length === 0 &&
            !localStorage.getItem(
                "personalAI_cloud_migrated"
            )
        ) {
            const localChats =
                loadLocalChats();

            if (localChats.length) {
                await migrateLocalChats(
                    localChats
                );

                localStorage.setItem(
                    "personalAI_cloud_migrated",
                    "1"
                );

                return;
            }
        }

        if (chats.length === 0) {

            setCurrentChat(null);

            conversationHistory =
                [];

            renderMessages(null);

            return;
        }

        let target =
            chats.find(
                chat =>
                    String(chat.id) ===
                    String(currentChatId)
            );

        if (!target) {
            target =
                chats[0];

            setCurrentChat(
                target.id
            );
        }

        await openChat(
            target.id
        );

    } catch (error) {

        console.error(
            "Cloud chat load failed:",
            error
        );

        /*
         * Local fallback.
         */
        chats =
            loadLocalChats();

        renderChatList();

        if (chats.length) {

            let target =
                chats.find(
                    chat =>
                        String(chat.id) ===
                        String(currentChatId)
                );

            if (!target) {
                target =
                    chats[0];

                setCurrentChat(
                    target.id
                );
            }

            conversationHistory =
                (target.messages || []).map(
                    item => ({
                        role: item.role,
                        content: item.content
                    })
                );

            renderMessages(
                target
            );

        } else {

            renderMessages(
                null
            );
        }
    }
}


/* =========================================================
   MIGRATE V1 LOCAL CHATS
   ========================================================= */

async function migrateLocalChats(
    localChats
) {

    for (const localChat of localChats) {

        const title =
            localChat.title ||
            "New Chat";

        const created =
            await apiRequest(
                "/chats",
                {
                    method: "POST",
                    body: makeFormData({
                        title
                    })
                }
            );

        if (
            !created.chat
        ) {
            continue;
        }

        const remoteChat =
            {
                id: created.chat.id,
                title:
                    created.chat.title,
                pinned:
                    Number(
                        created.chat.pinned
                    ) || 0,
                messages: []
            };

        chats.unshift(
            remoteChat
        );

        const localMessages =
            Array.isArray(
                localChat.messages
            )
                ? localChat.messages
                : [];

        for (
            const item of localMessages
        ) {

            if (
                !item ||
                !item.role ||
                !item.content
            ) {
                continue;
            }

            try {

                await saveMessageToCloud(
                    remoteChat.id,
                    item.role,
                    item.content
                );

            } catch (error) {

                console.error(
                    "Migration message error:",
                    error
                );

            }
        }
    }

    chats.sort(
        (a, b) =>
            Number(b.pinned) -
            Number(a.pinned)
    );

    cacheChats();

    renderChatList();

    if (chats.length) {

        setCurrentChat(
            chats[0].id
        );

        await openChat(
            chats[0].id
        );
    }
}


/* =========================================================
   CREATE CHAT
   ========================================================= */

async function createChat(
    title = "New Chat"
) {

    try {

        const data =
            await apiRequest(
                "/chats",
                {
                    method: "POST",
                    body: makeFormData({
                        title:
                            title.trim() ||
                            "New Chat"
                    })
                }
            );

        const remote =
            data.chat;

        if (!remote) {
            throw new Error(
                "Chat create failed"
            );
        }

        const chat = {
            id: remote.id,
            title:
                remote.title ||
                "New Chat",
            pinned:
                Number(remote.pinned) || 0,
            messages: []
        };

        chats.unshift(
            chat
        );

        setCurrentChat(
            chat.id
        );

        conversationHistory =
            [];

        cacheChats();

        renderChatList();

        renderMessages(
            chat
        );

        return chat;

    } catch (error) {

        console.error(
            "Create chat error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   OPEN CHAT
   ========================================================= */

async function openChat(
    chatId
) {

    const chat =
        chats.find(
            item =>
                String(item.id) ===
                String(chatId)
        );

    if (!chat) {
        return;
    }

    setCurrentChat(
        chat.id
    );

    try {


const data =
    await apiRequest(
        `/chats/${encodeURIComponent(chat.id)}/messages`
    );
        chat.messages =
            Array.isArray(data.messages)
                ? data.messages.map(
                    item => ({
                        id: item.id,
                        chat_id:
                            item.chat_id,
                        role: item.role,
                        content:
                            item.content
                    })
                )
                : [];

    } catch (error) {

        console.error(
            "Open chat error:",
            error
        );

        /*
         * Use local cache if available.
         */
    }

    conversationHistory =
        (chat.messages || []).map(
            item => ({
                role: item.role,
                content: item.content
            })
        );

    renderMessages(
        chat
    );

    cacheChats();

    renderChatList();

    if (
        window.innerWidth <= 700 &&
        sidebar
    ) {
        closeMobileSidebar();
    }
}


/* =========================================================
   RENDER CHAT LIST
   ========================================================= */

function renderChatList(
    sourceChats = chats
) {

    if (!chatList) {
        return;
    }

    chatList.innerHTML =
        "";

    const list =
        Array.isArray(sourceChats)
            ? sourceChats
            : [];

    if (!list.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "v21-empty-history";

        empty.textContent =
            "No chats yet";

        chatList.appendChild(
            empty
        );

        return;
    }

    list.forEach(
        chat => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "v21-chat-row";

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "history-item" +
                (
                    String(chat.id) ===
                    String(currentChatId)
                        ? " active"
                        : ""
                );

            button.title =
                chat.title ||
                "New Chat";

            button.textContent =
                `${Number(chat.pinned) ? "📌 " : ""}` +
                (
                    chat.title ||
                    "New Chat"
                );

            button.addEventListener(
                "click",
                () => {
                    openChat(
                        chat.id
                    );
                }
            );

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "v21-chat-actions";


            /* PIN */

            const pinBtn =
                document.createElement(
                    "button"
                );

            pinBtn.type =
                "button";

            pinBtn.className =
                "v21-chat-action";

            pinBtn.textContent =
                Number(chat.pinned)
                    ? "📌"
                    : "☆";

            pinBtn.title =
                Number(chat.pinned)
                    ? "Unpin"
                    : "Pin";

            pinBtn.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await togglePin(
                        chat
                    );
                }
            );


            /* RENAME */

            const renameBtn =
                document.createElement(
                    "button"
                );

            renameBtn.type =
                "button";

            renameBtn.className =
                "v21-chat-action";

            renameBtn.textContent =
                "✏️";

            renameBtn.title =
                "Rename";

            renameBtn.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await renameChat(
                        chat
                    );
                }
            );


            /* DELETE */

            const deleteBtn =
                document.createElement(
                    "button"
                );

            deleteBtn.type =
                "button";

            deleteBtn.className =
                "v21-chat-action";

            deleteBtn.textContent =
                "🗑️";

            deleteBtn.title =
                "Delete";

            deleteBtn.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await deleteChat(
                        chat
                    );
                }
            );


            actions.appendChild(
                pinBtn
            );

            actions.appendChild(
                renameBtn
            );

            actions.appendChild(
                deleteBtn
            );


            row.appendChild(
                button
            );

            row.appendChild(
                actions
            );

            chatList.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   SEARCH CHATS
   ========================================================= */

async function searchChats(
    query
) {

    const q =
        query.trim();

    if (!q) {

        renderChatList();

        return;
    }

    try {

        const data =
            await apiRequest(
                `/search-chats?q=${encodeURIComponent(q)}`
            );

        const results =
            Array.isArray(data.chats)
                ? data.chats.map(
                    chat => ({
                        ...chat,
                        messages: []
                    })
                )
                : [];

        renderChatList(
            results
        );

    } catch (error) {

        console.error(
            "Search error:",
            error
        );
    }
}


/* =========================================================
   RENAME CHAT
   ========================================================= */

async function renameChat(
    chat
) {

    const currentTitle =
        chat.title ||
        "New Chat";

    const newTitle =
        window.prompt(
            "Chat name:",
            currentTitle
        );

    if (
        newTitle === null
    ) {
        return;
    }

    const title =
        newTitle.trim();

    if (!title) {
        return;
    }

    try {

        const data =
            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/rename`,
                {
                    method: "PATCH",
                    body: makeFormData({
                        title
                    })
                }
            );

        const updated =
            data.chat;

        chat.title =
            updated.title;

        chat.pinned =
            Number(
                updated.pinned
            ) || 0;

        cacheChats();

        renderChatList();

    } catch (error) {

        console.error(
            "Rename error:",
            error
        );

        alert(
            "Chat rename করা যায়নি।"
        );
    }
}


/* =========================================================
   PIN / UNPIN
   ========================================================= */

async function togglePin(
    chat
) {

    const nextValue =
        Number(chat.pinned)
            ? 0
            : 1;

    try {

        const data =
            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/pin`,
                {
                    method: "PATCH",
                    body: makeFormData({
                        pinned:
                            String(nextValue)
                    })
                }
            );

        const updated =
            data.chat;

        chat.pinned =
            Number(
                updated.pinned
            ) || 0;

        chats.sort(
            (a, b) =>
                Number(b.pinned) -
                Number(a.pinned)
        );

        cacheChats();

        renderChatList();

    } catch (error) {

        console.error(
            "Pin error:",
            error
        );

        alert(
            "Pin change করা যায়নি।"
        );
    }
}


/* =========================================================
   DELETE CHAT
   ========================================================= */

async function deleteChat(
    chat
) {

    const confirmed =
        window.confirm(
            `"${chat.title || "New Chat"}" delete করতে চাও?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await apiRequest(
            `/chats/${encodeURIComponent(chat.id)}`,
            {
                method: "DELETE"
            }
        );

        chats =
            chats.filter(
                item =>
                    String(item.id) !==
                    String(chat.id)
            );

        if (
            String(currentChatId) ===
            String(chat.id)
        ) {

            if (chats.length) {

                setCurrentChat(
                    chats[0].id
                );

                await openChat(
                    chats[0].id
                );

            } else {

                setCurrentChat(
                    null
                );

                conversationHistory =
                    [];

                renderMessages(
                    null
                );
            }
        }

        cacheChats();

        renderChatList();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Chat delete করা যায়নি।"
        );
    }
}


/* =========================================================
   RENDER MESSAGES
   ========================================================= */

function renderMessages(
    chat
) {

    if (!messages) {
        return;
    }

    messages.innerHTML =
        "";

    if (
        !chat ||
        !Array.isArray(chat.messages) ||
        chat.messages.length === 0
    ) {

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

    chat.messages.forEach(
        item => {

            addMessage(
                item.role === "user"
                    ? "user"
                    : "ai",
                item.content,
                item.imageUrl ||
                    null,
                false
            );
        }
    );

    scrollToBottom();
}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

if (uploadBtn) {

    uploadBtn.addEventListener(
        "click",
        () => {

            imageInput.click();

        }
    );
}


if (imageInput) {

    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image."
                );

                imageInput.value =
                    "";

                return;
            }

            selectedImage =
                file;

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    previewImage.src =
                        event.target.result;

                    imagePreview.classList.add(
                        "active"
                    );
                };

            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   REMOVE IMAGE
   ========================================================= */

if (removeImage) {

    removeImage.addEventListener(
        "click",
        () => {

            selectedImage =
                null;

            imageInput.value =
                "";

            previewImage.src =
                "";

            imagePreview.classList.remove(
                "active"
            );
        }
    );
}

/* =========================================================
   REGENERATE MESSAGE
   ========================================================= */

async function regenerateMessage(messageElement) {

    const chat = getCurrentChat();

    if (
        !chat ||
        !Array.isArray(chat.messages)
    ) {
        return;
    }

    const renderedMessages =
        Array.from(
            messages.querySelectorAll(".message")
        );

    const messageIndex =
        renderedMessages.indexOf(
            messageElement
        );

    if (messageIndex < 0) {
        return;
    }

    const aiMessage =
        chat.messages[messageIndex];

    if (
        !aiMessage ||
        aiMessage.role !== "assistant" ||
        !aiMessage.id
    ) {
        return;
    }

    /* Only regenerate the latest AI response */
    if (
        messageIndex !==
        chat.messages.length - 1
    ) {
        alert(
            "শুধু সর্বশেষ AI response regenerate করা যাবে।"
        );
        return;
    }

    const userMessage =
        chat.messages[messageIndex - 1];

    if (
        !userMessage ||
        userMessage.role !== "user"
    ) {
        return;
    }

    const textElement =
        messageElement.querySelector(
            ".message-text"
        );

    const copyBtn =
        messageElement.querySelector(
            ".copy-message-btn"
        );

    const regenerateBtn =
        messageElement.querySelector(
            ".regenerate-message-btn"
        );

    if (regenerateBtn) {
        regenerateBtn.disabled = true;
        regenerateBtn.textContent =
            "⏳ Regenerating...";
    }

    if (copyBtn) {
        copyBtn.disabled = true;
    }

    if (textElement) {
        textElement.classList.add(
            "typing"
        );

        textElement.innerHTML = `
            <span class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </span>
        `;
    }

    try {

        /* -----------------------------------------
           ASK AI AGAIN
           ----------------------------------------- */

        const previousHistory =
            chat.messages
                .slice(
                    0,
                    messageIndex - 1
                )
                .map(item => ({
                    role: item.role,
                    content: item.content
                }));

        const formData =
            new FormData();

        formData.append(
            "message",
            userMessage.content
        );

        formData.append(
            "history",
            JSON.stringify(
                previousHistory
            )
        );

        const response =
            await apiRequest(
                "/chat",
                {
                    method: "POST",
                    body: formData
                }
            );

        const aiReply =
            response.reply ||
            "No response received.";

        /* -----------------------------------------
           DELETE OLD AI MESSAGE FROM D1
           ----------------------------------------- */

        await apiRequest(
            `/chats/${encodeURIComponent(chat.id)}/messages/${encodeURIComponent(aiMessage.id)}`,
            {
                method: "DELETE"
            }
        );

        /* -----------------------------------------
           SAVE NEW AI MESSAGE
           ----------------------------------------- */

        const saved =
            await saveMessageToCloud(
                chat.id,
                "assistant",
                aiReply
            );

        const newMessage =
            saved.message;

        /* -----------------------------------------
           UPDATE LOCAL CHAT
           ----------------------------------------- */

        chat.messages[
            messageIndex
        ] = {
            id:
                newMessage &&
                newMessage.id
                    ? newMessage.id
                    : null,

            chat_id:
                chat.id,

            role:
                "assistant",

            content:
                aiReply
        };

        conversationHistory =
            chat.messages.map(
                item => ({
                    role: item.role,
                    content: item.content
                })
            );

        if (textElement) {
            textElement.classList.remove(
                "typing"
            );

            textElement.textContent =
                aiReply;
        }

        if (regenerateBtn) {
            regenerateBtn.disabled =
                false;

            regenerateBtn.textContent =
                "🔄 Regenerate";
        }

        if (copyBtn) {
            copyBtn.disabled =
                false;
        }

        cacheChats();
        renderChatList();
        scrollToBottom();

    } catch (error) {

        console.error(
            "Regenerate error:",
            error
        );

        if (textElement) {
            textElement.classList.remove(
                "typing"
            );

            textElement.textContent =
                error.message ||
                "Regenerate failed.";
        }

        if (regenerateBtn) {
            regenerateBtn.disabled =
                false;

            regenerateBtn.textContent =
                "🔄 Regenerate";
        }

        if (copyBtn) {
            copyBtn.disabled =
                false;
        }
    }
}
/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
    type,
    text,
    imageUrl = null,
    shouldScroll = true
) {

    const welcome =
        document.getElementById(
            "welcome"
        );

    if (welcome) {
        welcome.remove();
    }

    const message =
        document.createElement(
            "div"
        );

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

                        ${
                type === "ai"
                    ? `
                        <div class="ai-message-actions">

                            <button
                                class="copy-message-btn"
                                type="button"
                                title="Copy"
                            >
                                📋 Copy
                            </button>

                            <button
                                class="regenerate-message-btn"
                                type="button"
                                title="Regenerate"
                            >
                                🔄 Regenerate
                            </button>

                        </div>
                    `
                    : `
                        <div class="user-message-actions">

                            <button
                                class="edit-message-btn"
                                type="button"
                                title="Edit message"
                            >
                                ✏️ Edit
                            </button>

                        </div>
                    `
            }
        </div>
    `;

    const textElement =
        message.querySelector(
            ".message-text"
        );

    if (text) {
        textElement.textContent =
            text;
    }

    /* IMAGE */
    if (imageUrl) {

        const img =
            document.createElement(
                "img"
            );

        img.src =
            imageUrl;

        img.className =
            "chat-image";

        img.alt =
            "Uploaded image";

        message
            .querySelector(
                ".message-content"
            )
            .appendChild(
                img
            );
    }
    /* EDIT USER MESSAGE */
    if (type === "user") {

        const editBtn =
            message.querySelector(
                ".edit-message-btn"
            );

        if (editBtn) {

            editBtn.addEventListener(
                "click",
                () => {

                    const chat =
                        getCurrentChat();

                    if (
                        !chat ||
                        !Array.isArray(chat.messages)
                    ) {
                        return;
                    }

                    const renderedMessages =
                        Array.from(
                            messages.querySelectorAll(
                                ".message"
                            )
                        );

                    const messageIndex =
                        renderedMessages.indexOf(
                            message
                        );

                    if (
                        messageIndex < 0 ||
                        !chat.messages[messageIndex]
                    ) {
                        return;
                    }

                    const editedMessage =
                        chat.messages[
                            messageIndex
                        ];

                    if (
                        editedMessage.role !== "user"
                    ) {
                        return;
                    }

                    editingMessageIndex =
                        messageIndex;

                    messageInput.value =
                        editedMessage.content || "";

                    messageInput.style.height =
                        "auto";

                    messageInput.style.height =
                        Math.min(
                            messageInput.scrollHeight,
                            180
                        ) + "px";

                    messageInput.focus();

                    editBtn.textContent =
                        "✏️ Editing...";
                }
            );
        }
    }

    /* COPY + REGENERATE BUTTONS */
    if (type === "ai") {

        const copyBtn =
            message.querySelector(
                ".copy-message-btn"
            );

        const regenerateBtn =
            message.querySelector(
                ".regenerate-message-btn"
            );

        /* COPY */
        copyBtn.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        text || ""
                    );

                    copyBtn.textContent =
                        "✅ Copied";

                    setTimeout(
                        () => {
                            copyBtn.textContent =
                                "📋 Copy";
                        },
                        1500
                    );

                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                    copyBtn.textContent =
                        "❌ Failed";
                }
            }
        );

        /* REGENERATE */
        regenerateBtn.addEventListener(
            "click",
            async () => {

                await regenerateMessage(
                    message
                );

            }
        );
    }

    messages.appendChild(
        message
    );

    if (shouldScroll) {
        scrollToBottom();
    }

    return message;
}
/* =========================================================
   IMAGE LIGHTBOX
   ========================================================= */

function openImageLightbox(src) {

    let lightbox =
        document.getElementById(
            "imageLightbox"
        );

    if (!lightbox) {

        lightbox =
            document.createElement("div");

        lightbox.id =
            "imageLightbox";

        lightbox.className =
            "image-lightbox";

        lightbox.innerHTML = `
            <button
                type="button"
                class="image-lightbox-close"
                aria-label="Close"
            >
                ×
            </button>

            <img
                src=""
                alt="Full size image"
            >
        `;

        document.body.appendChild(
            lightbox
        );

        lightbox.addEventListener(
            "click",
            event => {

                if (
                    event.target === lightbox
                ) {
                    closeImageLightbox();
                }
            }
        );

        lightbox
            .querySelector(
                ".image-lightbox-close"
            )
            .addEventListener(
                "click",
                closeImageLightbox
            );
    }

    lightbox.querySelector("img").src =
        src;

    lightbox.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


function closeImageLightbox() {

    const lightbox =
        document.getElementById(
            "imageLightbox"
        );

    if (!lightbox) {
        return;
    }

    lightbox.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeImageLightbox();
        }
    }
);


/* Make chat images clickable */
document.addEventListener(
    "click",
    event => {

        const image =
            event.target.closest(
                ".chat-image"
            );

        if (!image) {
            return;
        }

        openImageLightbox(
            image.src
        );
    }
);
/* =========================================================
   LOADING MESSAGE
   ========================================================= */

function addLoadingMessage() {

    const welcome =
        document.getElementById(
            "welcome"
        );

    if (welcome) {
        welcome.remove();
    }

    const message =
        document.createElement(
            "div"
        );

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
                <span class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>

        </div>
    `;

    messages.appendChild(
        message
    );

    scrollToBottom();

    return message;
}

/* =========================================================
   SAVE MESSAGE TO CLOUD
   ========================================================= */

async function saveMessageToCloud(
    chatId,
    role,
    content
) {

    return await apiRequest(
        `/chats/${encodeURIComponent(chatId)}/messages`,
        {
            method: "POST",
            body: makeFormData({
                role,
                content
            })
        }
    );
}

/* =========================================================
   EDIT MESSAGE
   ========================================================= */

async function editMessage(
    messageIndex,
    newText
) {

    const chat =
        getCurrentChat();

    if (
        !chat ||
        !Array.isArray(chat.messages)
    ) {
        return;
    }

    const oldUserMessage =
        chat.messages[messageIndex];

    const oldAiMessage =
        chat.messages[messageIndex + 1];

    if (
        !oldUserMessage ||
        oldUserMessage.role !== "user"
    ) {
        return;
    }

    if (
        oldAiMessage &&
        oldAiMessage.role !== "assistant"
    ) {
        return;
    }

    sendBtn.disabled = true;

    const originalText =
        newText;

    editingMessageIndex = null;

    try {

        /* -----------------------------------------
           AI REQUEST
           ----------------------------------------- */

        const previousHistory =
            chat.messages
                .slice(
                    0,
                    messageIndex
                )
                .map(item => ({
                    role:
                        item.role,
                    content:
                        item.content
                }));

        const formData =
            new FormData();

        formData.append(
            "message",
            originalText
        );

        formData.append(
            "history",
            JSON.stringify(
                previousHistory
            )
        );

        const loadingMessage =
            addLoadingMessage();

        const response =
            await apiRequest(
                "/chat",
                {
                    method: "POST",
                    body: formData
                }
            );

        loadingMessage.remove();

        const aiReply =
            response.reply ||
            "No response received.";


        /* -----------------------------------------
           DELETE OLD MESSAGES FROM D1
           ----------------------------------------- */

        if (
            oldAiMessage &&
            oldAiMessage.id
        ) {

            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/messages/${encodeURIComponent(oldAiMessage.id)}`,
                {
                    method: "DELETE"
                }
            );
        }

        if (
            oldUserMessage.id
        ) {

            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/messages/${encodeURIComponent(oldUserMessage.id)}`,
                {
                    method: "DELETE"
                }
            );
        }


        /* -----------------------------------------
           SAVE NEW USER MESSAGE
           ----------------------------------------- */

        const savedUser =
            await saveMessageToCloud(
                chat.id,
                "user",
                originalText
            );

        const savedUserMessage =
            savedUser &&
            savedUser.message
                ? savedUser.message
                : null;


        /* -----------------------------------------
           SAVE NEW AI MESSAGE
           ----------------------------------------- */

        const savedAssistant =
            await saveMessageToCloud(
                chat.id,
                "assistant",
                aiReply
            );

        const savedAssistantMessage =
            savedAssistant &&
            savedAssistant.message
                ? savedAssistant.message
                : null;


        /* -----------------------------------------
           UPDATE LOCAL CHAT
           ----------------------------------------- */

        const newUserMessage = {
            id:
                savedUserMessage &&
                savedUserMessage.id
                    ? savedUserMessage.id
                    : null,

            chat_id:
                chat.id,

            role:
                "user",

            content:
                originalText
        };

        const newAiMessage = {
            id:
                savedAssistantMessage &&
                savedAssistantMessage.id
                    ? savedAssistantMessage.id
                    : null,

            chat_id:
                chat.id,

            role:
                "assistant",

            content:
                aiReply
        };

        chat.messages.splice(
            messageIndex,
            oldAiMessage ? 2 : 1,
            newUserMessage,
            newAiMessage
        );


        conversationHistory =
            chat.messages.map(
                item => ({
                    role:
                        item.role,
                    content:
                        item.content
                })
            );


        /* -----------------------------------------
           CLEAR INPUT
           ----------------------------------------- */

        messageInput.value =
            "";

        messageInput.style.height =
            "auto";


        cacheChats();

        renderMessages(
            chat
        );

        renderChatList();

        scrollToBottom();

    } catch (error) {

        console.error(
            "Edit message error:",
            error
        );

        alert(
            error.message ||
            "Message edit করা যায়নি।"
        );

    } finally {

        sendBtn.disabled =
            false;

        editingMessageIndex =
            null;

        messageInput.focus();
    }
}
/* =========================================================
   SEND CHAT
   ========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const message =
    messageInput.value.trim();

if (
    !message &&
    !selectedImage
) {
    return;
}

/* EDIT MODE */

if (
    editingMessageIndex !== null
) {

    if (selectedImage) {
        alert(
            "Edit করার সময় image upload করা যাবে না।"
        );
        return;
    }

    await editMessage(
        editingMessageIndex,
        message
    );

    return;
}

sendBtn.disabled =
    true;

            const imageToSend =
                selectedImage;

            let imageUrl =
                null;

            if (imageToSend) {

                imageUrl =
                    URL.createObjectURL(
                        imageToSend
                    );
            }


            /* -----------------------------------------
               CREATE CHAT IF NEEDED
               ----------------------------------------- */

            let chat =
                getCurrentChat();

            try {

                if (!chat) {

                    chat =
                        await createChat(
                            message ||
                            "Image Chat"
                        );

                }


                /* -----------------------------------------
                   AUTO TITLE
                   ----------------------------------------- */

                if (
                    chat.title ===
                        "New Chat" &&
                    message
                ) {

                    const title =
                        message.slice(
                            0,
                            35
                        );

                    try {

                        const formData =
                             new FormData();

                        formData.append(
                            "title",
                            title
                     );

                    const data =
                         await apiRequest(
                             `/chats/${encodeURIComponent(chat.id)}/rename`,
                             {
                                method: "PATCH",
                                body: formData
                             }
                         );

                        chat.title =
                            data.chat.title;

                    } catch (error) {

                        console.error(
                            "Auto title error:",
                            error
                        );
                    }
                }


                /* -----------------------------------------
                   USER MESSAGE
                   ----------------------------------------- */

                const userText =
                    message ||
                    "Image uploaded";

                addMessage(
                    "user",
                    userText,
                    imageUrl
                );

                chat.messages =
                    chat.messages || [];

                chat.messages.push({
                    role:
                        "user",
                    content:
                        userText,
                    imageUrl
                });

                conversationHistory.push({
                    role:
                        "user",
                    content:
                        userText
                });

                const savedUser =
                    await saveMessageToCloud(
                        chat.id,
                        "user",
                        userText
                    );

                if (
                    savedUser &&
                    savedUser.message &&
                    savedUser.message.id
                ) {
                    chat.messages[
                        chat.messages.length - 1
                    ].id =
                        savedUser.message.id;
                }

                cacheChats();

                renderChatList();


                messageInput.value =
                    "";

                messageInput.style.height =
                    "auto";

                const loadingMessage =
                    addLoadingMessage();


                /* -----------------------------------------
                   AI REQUEST
                   ----------------------------------------- */

                let response;


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
                            conversationHistory.slice(
                                0,
                                -1
                            )
                        )
                    );

                    response =
                        await apiRequest(
                            "/chat-image",
                            {
                                method: "POST",
                                body:
                                    formData
                            }
                        );

                } else {

                    const formData =
                        new FormData();

                    formData.append(
                        "message",
                        message
                    );

                    formData.append(
                        "history",
                        JSON.stringify(
                            conversationHistory.slice(
                                0,
                                -1
                            )
                        )
                    );

                    response =
                        await apiRequest(
                            "/chat",
                            {
                                method: "POST",
                                body:
                                    formData
                            }
                        );
                }


                loadingMessage.remove();


                /* -----------------------------------------
                   AI RESPONSE
                   ----------------------------------------- */

                const aiReply =
                    response.reply ||
                    "No response received.";

                addMessage(
                    "ai",
                    aiReply
                );

                chat.messages.push({
                    role:
                        "assistant",
                    content:
                        aiReply
                });

                conversationHistory.push({
                    role:
                        "assistant",
                    content:
                        aiReply
                });


                const savedAssistant =
                    await saveMessageToCloud(
                        chat.id,
                        "assistant",
                        aiReply
                    );

                if (
                    savedAssistant &&
                    savedAssistant.message &&
                    savedAssistant.message.id
                ) {
                    chat.messages[
                        chat.messages.length - 1
                    ].id =
                        savedAssistant.message.id;
                }

                cacheChats();

                renderChatList();

            } catch (error) {

                console.error(
                    error
                );

                const existingTyping =
                    document.querySelector(
                        ".typing"
                    );

                if (
                    existingTyping &&
                    existingTyping.closest(
                        ".message"
                    )
                ) {

                    existingTyping
                        .closest(
                            ".message"
                        )
                        .remove();
                }

                let errorText =
                    "Connection error. Please check the server.";

                if (
                    error &&
                    error.message
                ) {
                    errorText =
                        error.message;
                }

                addMessage(
                    "ai",
                    errorText
                );

            } finally {

                sendBtn.disabled =
                    false;

                selectedImage =
                    null;

                imageInput.value =
                    "";

                previewImage.src =
                    "";

                imagePreview.classList.remove(
                    "active"
                );

                messageInput.focus();
            }
        }
    );
}


/* =========================================================
   NEW CHAT
   ========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        async () => {

            try {

                await createChat(
                    "New Chat"
                );

                if (searchInput) {
                    searchInput.value =
                        "";
                }

                messageInput.value =
                    "";

                messageInput.style.height =
                    "auto";

                selectedImage =
                    null;

                imageInput.value =
                    "";

                previewImage.src =
                    "";

                imagePreview.classList.remove(
                    "active"
                );

                messageInput.focus();

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "New chat তৈরি করা যায়নি।"
                );
            }
        }
    );
}


/* =========================================================
   MOBILE SIDEBAR — V2.2 POLISH
   ========================================================= */

let mobileOverlay = null;

function ensureMobileOverlay() {

    if (mobileOverlay) {
        return mobileOverlay;
    }

    mobileOverlay =
        document.getElementById(
            "personal-ai-mobile-overlay"
        );

    if (!mobileOverlay) {

        mobileOverlay =
            document.createElement("div");

        mobileOverlay.id =
            "personal-ai-mobile-overlay";

        mobileOverlay.className =
            "personal-ai-mobile-overlay";

        document.body.appendChild(
            mobileOverlay
        );

        mobileOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    return mobileOverlay;
}

function syncMobileSidebarState() {

    if (!sidebar) {
        return;
    }

    const isMobile =
        window.innerWidth <= 700;

    const isOpen =
        isMobile &&
        sidebar.classList.contains("open");

    const overlay =
        ensureMobileOverlay();

    overlay.classList.toggle(
        "active",
        isOpen
    );

    document.body.classList.toggle(
        "personal-ai-sidebar-open",
        isOpen
    );

    if (!isMobile) {

        sidebar.classList.remove("open");
        overlay.classList.remove("active");

        document.body.classList.remove(
            "personal-ai-sidebar-open"
        );
    }
}

function openMobileSidebar() {

    if (
        !sidebar ||
        window.innerWidth > 700
    ) {
        return;
    }

    ensureMobileOverlay();

    sidebar.classList.add("open");

    syncMobileSidebarState();
}

function closeMobileSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove("open");

    if (mobileOverlay) {
        mobileOverlay.classList.remove(
            "active"
        );
    }

    document.body.classList.remove(
        "personal-ai-sidebar-open"
    );
}

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            if (!sidebar) {
                return;
            }

            if (
                sidebar.classList.contains("open")
            ) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        }
    );
}

window.addEventListener(
    "resize",
    syncMobileSidebarState
);

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            window.innerWidth <= 700 &&
            sidebar &&
            sidebar.classList.contains("open")
        ) {
            closeMobileSidebar();
        }
    }
);


/* =========================================================
   CLOSE MOBILE SIDEBAR
   ========================================================= */

if (messages) {

    messages.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 700
            ) {
                closeMobileSidebar();
            }
        }
    );
}


/* =========================================================
   ENTER TO SEND
   ========================================================= */

if (messageInput) {

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
}


/* =========================================================
   AUTO RESIZE
   ========================================================= */

if (messageInput) {

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
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    setTimeout(
        () => {

            if (!messages) {
                return;
            }

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


/* =========================================================
   CHECK EXISTING SESSION
   ========================================================= */

async function checkSession() {

    try {

        const data =
            await apiRequest(
                "/check-session"
            );

        if (
            data &&
            data.logged_in
        ) {

            showApp();

            return true;
        }

        showLogin();

        return false;

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

        showLogin();

        return false;
    }
}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

async function initializeApp() {

    setupChatTools();

    if (app) {
        app.style.display =
            "none";
    }

    if (loginScreen) {
        loginScreen.style.display =
            "flex";
    }

    const loggedIn =
        await checkSession();

    if (!loggedIn) {
        return;
    }

    await loadCloudChats();
}


/* =========================================================
   START
   ========================================================= */

initializeApp();