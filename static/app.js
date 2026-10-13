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


document.addEventListener(
    "click",
    event => {

        const suggestion =
            event.target.closest(
                ".welcome-suggestion"
            );

        if (!suggestion || !messageInput) {
            return;
        }

        messageInput.value =
            suggestion.dataset.prompt || "";

        messageInput.dispatchEvent(
            new Event("input")
        );

        messageInput.focus();
    }
);
const messages =
    document.getElementById("messages");

const uploadBtn =
    document.getElementById("uploadBtn");

const imageInput =
    document.getElementById("imageInput");

const fileBtn =
    document.getElementById("fileBtn");

    const fileInput =
    document.getElementById("fileInput");
let selectedFile = null;
const filePreview =
    document.getElementById("filePreview");

const filePreviewName =
    document.getElementById("filePreviewName");

const removeFile =
    document.getElementById("removeFile");
if (fileBtn && fileInput) {

    fileBtn.addEventListener(
        "click",
        () => {
            fileInput.click();
        }
    );
if (removeFile) {
    removeFile.addEventListener(
        "click",
        () => {
            selectedFile = null;

            fileInput.value = "";

            if (filePreview) {
                filePreviewName.textContent =
                    "";

                filePreview.style.display =
                "none";
                ;
            }
        }
    );
}
    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files[0];

            if (!file) {
                return;
            }

            const allowedTypes = [
                "text/plain",
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];

            const allowedExtensions = [
                ".txt",
                ".pdf",
                ".docx"
            ];

            const filename =
                file.name.toLowerCase();

            const validType =
                allowedTypes.includes(
                    file.type
                );

            const validExtension =
                allowedExtensions.some(
                    ext =>
                        filename.endsWith(ext)
                );

            if (
                !validType &&
                !validExtension
            ) {
                alert(
                    "শুধু TXT, PDF এবং DOCX file দেওয়া যাবে।"
                );

                fileInput.value = "";
                return;
            }

            // Maximum 10 MB
            if (
                file.size >
                10 * 1024 * 1024
            ) {
                alert(
                    "File size সর্বোচ্চ 10 MB হতে পারবে।"
                );

                fileInput.value = "";
                return;
            }

            try {

                fileBtn.classList.add("is-loading");
                fileBtn.disabled = true;

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                const data =
                    await apiRequest(
                        "/upload-file",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                selectedFile = {
                    name:
                        data.filename,
                    text:
                        data.text
                };
if (filePreview) {
    filePreviewName.textContent =
        data.filename;

    filePreview.style.display =
        "flex";
}
                fileBtn.classList.remove("is-loading");

                alert(
                    `File loaded: ${data.filename}`
                );

            } catch (error) {

                console.error(
                    "File upload error:",
                    error
                );

                selectedFile = null;

                alert(
                    error.message ||
                    "File upload failed."
                );

                fileBtn.classList.remove("is-loading");

            } finally {

                fileBtn.classList.remove("is-loading");
                fileBtn.disabled = false;
                fileInput.value = "";

            }
        }
    );
}


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

/* =========================================================
   SIDEBAR — STEP 2 DESKTOP CONTROLS
   ========================================================= */

const sidebarToggle =
    document.getElementById("sidebarToggle");

const sidebarResizer =
    document.getElementById("sidebarResizer");

let sidebarCollapsed =
    localStorage.getItem(
        "personalAI_sidebarCollapsed"
    ) === "true";

let sidebarWidth =
    Number(
        localStorage.getItem(
            "personalAI_sidebarWidth"
        )
    ) || 272;

sidebarWidth = Math.min(
    380,
    Math.max(
        220,
        sidebarWidth
    )
);

function applySidebarLayout() {

    if (!sidebar) {
        return;
    }

    const isMobile =
        window.innerWidth <= 700;

    if (!isMobile) {

        document.documentElement.style.setProperty(
            "--sidebar-width",
            sidebarCollapsed
                ? "76px"
                : `${sidebarWidth}px`
        );

        document.documentElement.style.setProperty(
            "--image-preview-offset",
            sidebarCollapsed
                ? "38px"
                : `${sidebarWidth / 2}px`
        );

    }

    sidebar.classList.toggle(
        "collapsed",
        !isMobile && sidebarCollapsed
    );

    if (sidebarToggle) {

        sidebarToggle.innerHTML = sidebarCollapsed
            ? `<svg class="sidebar-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`
            : `<svg class="sidebar-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>`;

        sidebarToggle.title =
            sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar";

        sidebarToggle.setAttribute(
            "aria-label",
            sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
        );

        sidebarToggle.setAttribute(
            "aria-expanded",
            String(!sidebarCollapsed)
        );
    }
}

applySidebarLayout();

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            if (window.innerWidth <= 700) {
                return;
            }

            sidebarCollapsed =
                !sidebarCollapsed;

            localStorage.setItem(
                "personalAI_sidebarCollapsed",
                String(sidebarCollapsed)
            );

            applySidebarLayout();
        }
    );
}

if (sidebarResizer && sidebar) {

    let resizingSidebar = false;
    let startX = 0;
    let startWidth = sidebarWidth;

    sidebarResizer.addEventListener(
        "pointerdown",
        event => {

            if (window.innerWidth <= 700 || sidebarCollapsed) {
                return;
            }

            resizingSidebar = true;
            startX = event.clientX;
            startWidth = sidebarWidth;

            sidebar.classList.add(
                "resizing"
            );

            sidebarResizer.setPointerCapture?.(
                event.pointerId
            );

            event.preventDefault();
        }
    );

    sidebarResizer.addEventListener(
        "pointermove",
        event => {

            if (!resizingSidebar) {
                return;
            }

            sidebarWidth = Math.min(
                380,
                Math.max(
                    220,
                    startWidth +
                        (event.clientX - startX)
                )
            );

            localStorage.setItem(
                "personalAI_sidebarWidth",
                String(Math.round(sidebarWidth))
            );

            applySidebarLayout();
        }
    );

    const stopSidebarResize = () => {

        if (!resizingSidebar) {
            return;
        }

        resizingSidebar = false;

        sidebar.classList.remove(
            "resizing"
        );
    };

    sidebarResizer.addEventListener(
        "pointerup",
        stopSidebarResize
    );

    sidebarResizer.addEventListener(
        "pointercancel",
        stopSidebarResize
    );

    sidebarResizer.addEventListener(
        "dblclick",
        () => {

            sidebarWidth = 272;

            localStorage.setItem(
                "personalAI_sidebarWidth",
                "272"
            );

            applySidebarLayout();
        }
    );
}

window.addEventListener(
    "resize",
    applySidebarLayout
);

const sendBtn =
    document.getElementById("sendBtn");

const voiceBtn =
    document.getElementById("voiceBtn");

let voiceRecognition = null;
let isRecordingVoice = false;

if (
    voiceBtn &&
    (
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window
    )
) {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    voiceRecognition =
        new SpeechRecognition();

    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;
    voiceRecognition.lang = "bn-BD";

    voiceRecognition.onstart = () => {
        isRecordingVoice = true;

        voiceBtn.classList.add(
            "recording"
        );

        voiceBtn.title = "Stop recording";
    };

    voiceRecognition.onresult = (
        event
    ) => {
        const transcript =
            event.results[0][0].transcript;

        if (transcript) {
            messageInput.value =
                (
                    messageInput.value
                    ? messageInput.value + " "
                    : ""
                ) + transcript;

            messageInput.dispatchEvent(
                new Event("input")
            );

            messageInput.focus();
        }
    };

    voiceRecognition.onerror = (
        event
    ) => {
        console.error(
            "Voice recognition error:",
            event.error
        );
    };

    voiceRecognition.onend = () => {
        isRecordingVoice = false;

        voiceBtn.classList.remove(
            "recording"
        );

        voiceBtn.title = "Voice input";
    };

    voiceBtn.addEventListener(
        "click",
        () => {
            if (isRecordingVoice) {
                voiceRecognition.stop();
            } else {
                voiceRecognition.start();
            }
        }
    );

} else if (voiceBtn) {
    voiceBtn.disabled = true;
    voiceBtn.title =
        "Voice input is not supported in this browser";
}

const plusMenuBtn = document.getElementById("plusMenuBtn");
const plusMenu = document.getElementById("plusMenu");

if (plusMenuBtn && plusMenu) {
    const closePlusMenu = () => {
        plusMenu.hidden = true;
        plusMenuBtn.setAttribute("aria-expanded", "false");
        plusMenuBtn.classList.remove("open");
    };

    plusMenuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = plusMenu.hidden;
        plusMenu.hidden = !open;
        plusMenuBtn.setAttribute("aria-expanded", String(open));
        plusMenuBtn.classList.toggle("open", open);
    });

    plusMenu.addEventListener("click", (event) => {
        event.stopPropagation();
        const item = event.target.closest(".composer-menu-item");
        if (item && item.id !== "webSearchBtn") {
            closePlusMenu();
        }
    });

    document.addEventListener("click", (event) => {
        if (!plusMenu.contains(event.target) && event.target !== plusMenuBtn) {
            closePlusMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !plusMenu.hidden) {
            closePlusMenu();
            plusMenuBtn.focus();
        }
    });
}

const chatList =
    document.getElementById("chatList");

const pinnedList =
    document.getElementById("pinnedList");

const pinnedSection =
    document.getElementById("pinnedSection");

const recentsSection =
    document.getElementById("recentsSection");

const recentsLabel =
    document.getElementById("recentsLabel");


/* =========================================================
   STATE
   ========================================================= */

let selectedImage = null;

let chats = [];

let currentChatId =
    localStorage.getItem("personalAI_currentChat");

let conversationHistory = [];

// =========================
// CHAT CONTEXT INDICATOR
// =========================

const contextIndicator =
    document.createElement("div");

contextIndicator.id =
    "contextIndicator";

contextIndicator.textContent =
    "🧠 Context: 0 / 30 messages";

contextIndicator.style.cssText = `
    margin: 0 0 6px 4px;
    font-size: 11px;
    line-height: 1.3;
    color: var(--muted-text, #888);
    opacity: 0.72;
`;

const chatFormElement =
    document.getElementById("chatForm");

if (
    chatFormElement &&
    chatFormElement.parentElement
) {
    chatFormElement.parentElement.insertBefore(
        contextIndicator,
        chatFormElement
    );
}

function updateContextIndicator() {

    const count =
        Array.isArray(conversationHistory)
            ? Math.min(
                conversationHistory.length,
                30
            )
            : 0;

    contextIndicator.textContent =
        `🧠 Context: ${count} / 30 messages`;
}

updateContextIndicator();


let searchInput = null;

let editingMessageIndex = null;

/* =========================================================
   CHAT FOLDERS STATE
   ========================================================= */

let folders = [];
let currentFolderId = null;
let folderPicker = null;

const folderList =
    document.getElementById("folderList");

const newFolderBtn =
    document.getElementById("newFolderBtn");


let currentTheme =
    localStorage.getItem("personalAI_theme") ||
    "dark";

let currentAccent =
    localStorage.getItem(
        "personalAI_accent"
    ) || "#ffffff";

let currentFontSize =
    localStorage.getItem(
        "personalAI_fontSize"
    ) || "medium";
function applyFontSize() {

    const size =
        currentFontSize === "small"
            ? "13px"
            : currentFontSize === "large"
                ? "17px"
                : "15px";

    document.documentElement.style.setProperty(
        "--chat-font-size",
        size
    );

    document
        .querySelectorAll(".message-text")
        .forEach(element => {
            element.style.setProperty(
                "font-size",
                size,
                "important"
            );
        });

    localStorage.setItem(
        "personalAI_fontSize",
        currentFontSize
    );
}

applyFontSize();

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
function applyAccent() {

    document.documentElement.style.setProperty(
        "--accent",
        currentAccent
    );

    localStorage.setItem(
        "personalAI_accent",
        currentAccent
    );
}
applyAccent();

/* =========================================================
   SETTINGS PANEL — STEP 1
   ========================================================= */

let settingsPanel = null;

let contextIndicatorEnabled =
    localStorage.getItem(
        "personalAI_contextIndicator"
    ) !== "false";
    
let enterToSendEnabled =
    localStorage.getItem(
        "personalAI_enterToSend"
    ) !== "false";

let messageTimestampEnabled =
    localStorage.getItem(
        "personalAI_messageTimestamp"
    ) !== "false";
let autoScrollEnabled =
    localStorage.getItem(
        "personalAI_autoScroll"
    ) !== "false";

let notificationsEnabled =
    localStorage.getItem(
        "personalAI_notifications"
    ) !== "false";

 let webSearchEnabled =
    localStorage.getItem(
        "personalAI_webSearch"
    ) !== "false";

let privateModeEnabled =
    localStorage.getItem(
        "personalAI_privateMode"
    ) === "true";

const privateModeBtn =
    document.getElementById(
        "privateModeBtn"
    );

function updatePrivateModeButton() {

    if (!privateModeBtn) {
        return;
    }

    privateModeBtn.classList.toggle(
        "active",
        privateModeEnabled
    );

    privateModeBtn.setAttribute(
        "aria-pressed",
        String(privateModeEnabled)
    );

    privateModeBtn.innerHTML = `
        <svg class="private-mode-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
        </svg>
        <span class="private-mode-label">Private</span>
    `;

    privateModeBtn.title =
        privateModeEnabled
            ? "Private Mode: On"
            : "Private Mode: Off";
}

updatePrivateModeButton();

if (privateModeBtn) {

    privateModeBtn.addEventListener(
        "click",
        () => {

            privateModeEnabled =
                !privateModeEnabled;

            localStorage.setItem(
                "personalAI_privateMode",
                String(privateModeEnabled)
            );

            updatePrivateModeButton();

            if (privateModeEnabled) {
                setCurrentChat(null);

                conversationHistory = [];

                updateContextIndicator();

                renderMessages(null);
            }
        }
    );
}

const webSearchBtn =
    document.getElementById("webSearchBtn");

if (webSearchBtn) {

    if (!document.getElementById("personal-ai-web-search-style")) {
        const webSearchStyle = document.createElement("style");
        webSearchStyle.id = "personal-ai-web-search-style";
        webSearchStyle.textContent = `
            #webSearchBtn {
                position: relative;
                transition: background 0.2s ease, border-color 0.2s ease,
                    box-shadow 0.2s ease, transform 0.15s ease;
            }

            #webSearchBtn:active {
                transform: scale(0.985);
            }
        `;
        document.head.appendChild(webSearchStyle);
    }

    const updateWebSearchButton = () => {
        webSearchBtn.classList.toggle(
            "active",
            webSearchEnabled
        );

        webSearchBtn.setAttribute(
            "aria-pressed",
            String(webSearchEnabled)
        );

        webSearchBtn.title =
            webSearchEnabled
                ? "Web Search: ON — click to turn OFF"
                : "Web Search: OFF — click to turn ON";
    };

    updateWebSearchButton();

    webSearchBtn.addEventListener(
        "click",
        () => {

            webSearchEnabled =
                !webSearchEnabled;

            localStorage.setItem(
                "personalAI_webSearch",
                String(webSearchEnabled)
            );

            updateWebSearchButton();
        }
    );
}
function applyContextIndicatorSetting() {

    if (!contextIndicator) {
        return;
    }

    contextIndicator.style.display =
        contextIndicatorEnabled
            ? "block"
            : "none";
}


function applyMessageTimestampSetting() {

    document
        .querySelectorAll(
            ".message-timestamp"
        )
        .forEach(element => {
            element.style.display =
                messageTimestampEnabled
                    ? ""
                    : "none";
        });
}


applyContextIndicatorSetting();


function injectSettingsStyles() {

    if (
        document.getElementById(
            "personal-ai-settings-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "personal-ai-settings-styles";

    style.textContent = `
        .personal-ai-settings-overlay {
            position: fixed;
            inset: 0;
            z-index: 6000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.42);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
        }

        .personal-ai-settings-panel {
            width: min(92vw, 430px);
            max-height: min(82vh, 620px);
            overflow-y: auto;
            box-sizing: border-box;
            padding: 18px;
            border: 1px solid var(--border);
            border-radius: 16px;
            background: var(--card);
            color: var(--text);
            box-shadow: 0 20px 55px rgba(0, 0, 0, 0.28);
        }

        .personal-ai-settings-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
        }

        .personal-ai-settings-title {
            font-size: 18px;
            font-weight: 700;
        }

        .personal-ai-settings-close {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 9px;
            background: var(--hover);
            color: var(--text);
            cursor: pointer;
            font-size: 18px;
        }

        .personal-ai-settings-section {
            margin-top: 14px;
        }

        .personal-ai-settings-section-title {
            margin-bottom: 7px;
            font-size: 12px;
            font-weight: 700;
            opacity: 0.6;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .personal-ai-settings-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            padding: 11px 12px;
            box-sizing: border-box;
            border: 1px solid var(--border);
            border-radius: 11px;
            background: var(--hover);
            color: var(--text);
        }

        .personal-ai-settings-row + .personal-ai-settings-row {
            margin-top: 7px;
        }

        .personal-ai-settings-row-main {
            min-width: 0;
        }

        .personal-ai-settings-row-title {
            font-size: 14px;
            font-weight: 600;
        }

        .personal-ai-settings-row-subtitle {
            margin-top: 2px;
            font-size: 11px;
            opacity: 0.58;
        }

        .personal-ai-settings-action {
            flex-shrink: 0;
            padding: 7px 10px;
            border: 1px solid var(--border);
            border-radius: 9px;
            background: var(--card);
            color: var(--text);
            cursor: pointer;
            font-size: 12px;
        }

        .personal-ai-settings-action:hover,
        .personal-ai-settings-close:hover {
            filter: brightness(1.06);
        }

        @media (max-width: 700px) {
            .personal-ai-settings-overlay {
                padding: 12px;
            }

            .personal-ai-settings-panel {
                width: 100%;
                max-height: 86vh;
                border-radius: 14px;
            }
        }
    `;

    document.head.appendChild(style);
}


function closeSettingsPanel() {

    if (settingsPanel) {
        settingsPanel.remove();
        settingsPanel = null;
        document.body.style.overflow = "";
    }
}


function openSettingsPanel() {

    closeSettingsPanel();
    injectSettingsStyles();

    settingsPanel =
        document.createElement("div");

    settingsPanel.className =
        "personal-ai-settings-overlay";

    settingsPanel.setAttribute(
        "role",
        "dialog"
    );

    settingsPanel.setAttribute(
        "aria-modal",
        "true"
    );

    const panel =
        document.createElement("div");

    panel.className =
        "personal-ai-settings-panel";

    panel.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );

    const head =
        document.createElement("div");

    head.className =
        "personal-ai-settings-head";

    const title =
        document.createElement("div");

    title.className =
        "personal-ai-settings-title";

    title.innerHTML = `
        <svg class="settings-title-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H22v2.6h-.4a1.7 1.7 0 0 0-1.6 1Z"/>
        </svg>
        <span>Settings</span>
    `;

    const closeBtn =
        document.createElement("button");

    closeBtn.type = "button";
    closeBtn.className =
        "personal-ai-settings-close";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    closeBtn.addEventListener(
        "click",
        closeSettingsPanel
    );

    head.appendChild(title);
    head.appendChild(closeBtn);

    const appearanceSection =
        document.createElement("div");

    appearanceSection.className =
        "personal-ai-settings-section";

    const appearanceTitle =
        document.createElement("div");

    appearanceTitle.className =
        "personal-ai-settings-section-title";

    appearanceTitle.textContent =
        "Appearance";

    const themeRow =
        document.createElement("div");

    themeRow.className =
        "personal-ai-settings-row";

    const themeInfo =
        document.createElement("div");

    themeInfo.className =
        "personal-ai-settings-row-main";

    const themeName =
        document.createElement("div");

    themeName.className =
        "personal-ai-settings-row-title";

    themeName.textContent =
        "Theme";

    const themeSubtitle =
        document.createElement("div");

    themeSubtitle.className =
        "personal-ai-settings-row-subtitle";

    themeSubtitle.textContent =
        "Change between dark and light mode.";

    themeInfo.appendChild(themeName);
    themeInfo.appendChild(themeSubtitle);

    const themeAction =
        document.createElement("button");

    themeAction.type = "button";
    themeAction.className =
        "personal-ai-settings-action";

    const updateThemeAction =
        () => {
            themeAction.textContent =
                currentTheme === "dark"
                    ? "🌙 Dark Mode"
                    : "☀️ Light Mode";
        };

    updateThemeAction();

    themeAction.addEventListener(
        "click",
        () => {

            currentTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";

            applyTheme();
            updateThemeAction();

            if (themeBtn) {
                themeBtn.title =
                    "Open Settings";
            }
        }
    );

    themeRow.appendChild(themeInfo);
    themeRow.appendChild(themeAction);

    appearanceSection.appendChild(
        appearanceTitle
    );

    appearanceSection.appendChild(
        themeRow
    );

const accentRow =
    document.createElement("div");

accentRow.className =
    "personal-ai-settings-row";

const accentInfo =
    document.createElement("div");

accentInfo.className =
    "personal-ai-settings-row-main";

const accentName =
    document.createElement("div");

accentName.className =
    "personal-ai-settings-row-title";

accentName.textContent =
    "🎨 Accent Color";

const accentSubtitle =
    document.createElement("div");

accentSubtitle.className =
    "personal-ai-settings-row-subtitle";

accentSubtitle.textContent =
    "Choose your preferred accent color.";

accentInfo.appendChild(accentName);
accentInfo.appendChild(accentSubtitle);

const accentColors =
    document.createElement("div");

accentColors.style.display =
    "flex";

accentColors.style.alignItems =
    "center";

accentColors.style.gap =
    "7px";

accentColors.style.flexWrap =
    "wrap";


const colors = [
    "#ffffff",
    "#3b82f6",
    "#8b5cf6",
    "#22c55e",
    "#f97316"
];


colors.forEach(color => {

    const colorButton =
        document.createElement("button");

    colorButton.type = "button";

    colorButton.style.width =
        "26px";

    colorButton.style.height =
        "26px";

    colorButton.style.padding =
        "0";

    colorButton.style.borderRadius =
        "50%";

    colorButton.style.background =
        color;

    colorButton.style.border =
        currentAccent === color
            ? "2px solid var(--text)"
            : "2px solid transparent";

    colorButton.style.cursor =
        "pointer";

    colorButton.title =
        color;

    colorButton.classList.add(
        "personal-ai-accent-color"
    );

    colorButton.dataset.color =
        color;

    colorButton.addEventListener(
        "click",
        () => {

            currentAccent =
                color;

            applyAccent();

            document
                .querySelectorAll(
                    ".personal-ai-accent-color"
                )
                .forEach(button => {

                    button.style.border =
                        button.dataset.color ===
                        currentAccent
                            ? "2px solid var(--text)"
                            : "2px solid transparent";
                });

            customColor.value =
                currentAccent;
        }
    );

    accentColors.appendChild(
        colorButton
    );
});


/* =========================
   CUSTOM COLOR
   ========================= */

const customColor =
    document.createElement("input");

customColor.type =
    "color";

customColor.value =
    /^#[0-9A-Fa-f]{6}$/.test(currentAccent)
        ? currentAccent
        : "#ffffff";

customColor.title =
    "Custom Accent Color";

customColor.style.width =
    "30px";

customColor.style.height =
    "30px";

customColor.style.padding =
    "0";

customColor.style.border =
    "2px solid var(--text)";

customColor.style.borderRadius =
    "50%";

customColor.style.cursor =
    "pointer";

customColor.addEventListener(
    "input",
    () => {

        currentAccent =
            customColor.value;

        applyAccent();

        document
            .querySelectorAll(
                ".personal-ai-accent-color"
            )
            .forEach(button => {

                button.style.border =
                    "2px solid transparent";
            });
    }
);

accentColors.appendChild(
    customColor
);

accentRow.appendChild(
    accentInfo
);

accentRow.appendChild(
    accentColors
);

appearanceSection.appendChild(
    accentRow
);
const fontSizeRow =
    document.createElement("div");

fontSizeRow.className =
    "personal-ai-settings-row";

const fontSizeInfo =
    document.createElement("div");

fontSizeInfo.className =
    "personal-ai-settings-row-main";

const fontSizeName =
    document.createElement("div");

fontSizeName.className =
    "personal-ai-settings-row-title";

fontSizeName.textContent =
    "🔤 Font Size";

const fontSizeSubtitle =
    document.createElement("div");

fontSizeSubtitle.className =
    "personal-ai-settings-row-subtitle";

fontSizeSubtitle.textContent =
    "Choose your preferred text size.";

fontSizeInfo.appendChild(fontSizeName);
fontSizeInfo.appendChild(fontSizeSubtitle);

const fontSizeAction =
    document.createElement("button");

fontSizeAction.type = "button";

fontSizeAction.className =
    "personal-ai-settings-action";

const updateFontSizeAction =
    () => {
        const labels = {
            small: "Small",
            medium: "Medium",
            large: "Large"
        };

        fontSizeAction.textContent =
            labels[currentFontSize];
    };

updateFontSizeAction();

fontSizeAction.addEventListener(
    "click",
    () => {
        if (currentFontSize === "small") {
            currentFontSize = "medium";
        } else if (
            currentFontSize === "medium"
        ) {
            currentFontSize = "large";
        } else {
            currentFontSize = "small";
        }

        localStorage.setItem(
            "personalAI_fontSize",
            currentFontSize
        );
        applyFontSize();
        updateFontSizeAction();
    }
);

fontSizeRow.appendChild(fontSizeInfo);
fontSizeRow.appendChild(fontSizeAction);

appearanceSection.appendChild(
    fontSizeRow
);

    const chatSection =
        document.createElement("div");

    chatSection.className =
        "personal-ai-settings-section";

    const chatTitle =
        document.createElement("div");

    chatTitle.className =
        "personal-ai-settings-section-title";

    chatTitle.textContent =
        "Chat";

    const contextRow =
        document.createElement("div");

    contextRow.className =
        "personal-ai-settings-row";

    const contextInfo =
        document.createElement("div");

    contextInfo.className =
        "personal-ai-settings-row-main";

    const contextName =
        document.createElement("div");

    contextName.className =
        "personal-ai-settings-row-title";

    contextName.textContent =
        "🧠 Context Indicator";

    const contextSubtitle =
        document.createElement("div");

    contextSubtitle.className =
        "personal-ai-settings-row-subtitle";

    contextSubtitle.textContent =
        "Shows the current conversation context.";

    contextInfo.appendChild(contextName);
    contextInfo.appendChild(
        contextSubtitle
    );

    const contextAction =
        document.createElement("button");

    contextAction.type = "button";
    contextAction.className =
        "personal-ai-settings-action";

    const updateContextAction =
        () => {
            contextAction.textContent =
                contextIndicatorEnabled
                    ? "On"
                    : "Off";
        };

    updateContextAction();

    contextAction.addEventListener(
        "click",
        () => {

            contextIndicatorEnabled =
                !contextIndicatorEnabled;

            localStorage.setItem(
                "personalAI_contextIndicator",
                String(
                    contextIndicatorEnabled
                )
            );

            applyContextIndicatorSetting();
            updateContextAction();
        }
    );

    contextRow.appendChild(contextInfo);
    contextRow.appendChild(
        contextAction
    );

    const timestampRow =
        document.createElement("div");

    timestampRow.className =
        "personal-ai-settings-row";

    const timestampInfo =
        document.createElement("div");

    timestampInfo.className =
        "personal-ai-settings-row-main";

    const timestampName =
        document.createElement("div");

    timestampName.className =
        "personal-ai-settings-row-title";

    timestampName.textContent =
        "🕐 Message Timestamp";

    const timestampSubtitle =
        document.createElement("div");

    timestampSubtitle.className =
        "personal-ai-settings-row-subtitle";

    timestampSubtitle.textContent =
        "Show or hide message date and time.";

    timestampInfo.appendChild(
        timestampName
    );

    timestampInfo.appendChild(
        timestampSubtitle
    );

    const timestampAction =
        document.createElement("button");

    timestampAction.type = "button";
    timestampAction.className =
        "personal-ai-settings-action";

    const updateTimestampAction =
        () => {
            timestampAction.textContent =
                messageTimestampEnabled
                    ? "On"
                    : "Off";
        };

    updateTimestampAction();

    timestampAction.addEventListener(
        "click",
        () => {

            messageTimestampEnabled =
                !messageTimestampEnabled;

            localStorage.setItem(
                "personalAI_messageTimestamp",
                String(
                    messageTimestampEnabled
                )
            );

            applyMessageTimestampSetting();
            updateTimestampAction();
        }
    );

    timestampRow.appendChild(
        timestampInfo
    );

    timestampRow.appendChild(
        timestampAction
    );
const enterRow =
    document.createElement("div");

enterRow.className =
    "personal-ai-settings-row";

const enterInfo =
    document.createElement("div");

enterInfo.className =
    "personal-ai-settings-row-main";

const enterName =
    document.createElement("div");

enterName.className =
    "personal-ai-settings-row-title";

enterName.textContent =
    "↵ Enter to Send";

const enterSubtitle =
    document.createElement("div");

enterSubtitle.className =
    "personal-ai-settings-row-subtitle";

enterSubtitle.textContent =
    "Press Enter to send, Shift + Enter for a new line.";

enterInfo.appendChild(enterName);
enterInfo.appendChild(enterSubtitle);

const enterAction =
    document.createElement("button");

enterAction.type = "button";
enterAction.className =
    "personal-ai-settings-action";

const updateEnterAction =
    () => {
        enterAction.textContent =
            enterToSendEnabled
                ? "On"
                : "Off";
    };

updateEnterAction();

enterAction.addEventListener(
    "click",
    () => {

        enterToSendEnabled =
            !enterToSendEnabled;

        localStorage.setItem(
            "personalAI_enterToSend",
            String(
                enterToSendEnabled
            )
        );

        updateEnterAction();
    }
);

enterRow.appendChild(enterInfo);
enterRow.appendChild(enterAction);

chatSection.appendChild(enterRow);
    chatSection.appendChild(chatTitle);
    chatSection.appendChild(contextRow);
    chatSection.appendChild(timestampRow);

  const autoScrollRow =
    document.createElement("div");

autoScrollRow.className =
    "personal-ai-settings-row";

const autoScrollInfo =
    document.createElement("div");

autoScrollInfo.className =
    "personal-ai-settings-row-main";

const autoScrollName =
    document.createElement("div");

autoScrollName.className =
    "personal-ai-settings-row-title";

autoScrollName.textContent =
    "📜 Auto Scroll";

const autoScrollSubtitle =
    document.createElement("div");

autoScrollSubtitle.className =
    "personal-ai-settings-row-subtitle";

autoScrollSubtitle.textContent =
    "Automatically scroll to the latest message.";

autoScrollInfo.appendChild(
    autoScrollName
);

autoScrollInfo.appendChild(
    autoScrollSubtitle
);

const autoScrollAction =
    document.createElement("button");

autoScrollAction.type = "button";

autoScrollAction.className =
    "personal-ai-settings-action";

const updateAutoScrollAction =
    () => {
        autoScrollAction.textContent =
            autoScrollEnabled
                ? "On"
                : "Off";
    };

updateAutoScrollAction();

autoScrollAction.addEventListener(
    "click",
    () => {

        autoScrollEnabled =
            !autoScrollEnabled;

        localStorage.setItem(
            "personalAI_autoScroll",
            String(autoScrollEnabled)
        );

        updateAutoScrollAction();
    }
);

autoScrollRow.appendChild(
    autoScrollInfo
);

autoScrollRow.appendChild(
    autoScrollAction
);

chatSection.appendChild(
    autoScrollRow
);  
const notificationsRow =
    document.createElement("div");

notificationsRow.className =
    "personal-ai-settings-row";

const notificationsInfo =
    document.createElement("div");

notificationsInfo.className =
    "personal-ai-settings-row-main";

const notificationsName =
    document.createElement("div");

notificationsName.className =
    "personal-ai-settings-row-title";

notificationsName.textContent =
    "🔔 Notifications";

const notificationsSubtitle =
    document.createElement("div");

notificationsSubtitle.className =
    "personal-ai-settings-row-subtitle";

notificationsSubtitle.textContent =
    "Show a notification when an AI reply is ready.";

notificationsInfo.appendChild(
    notificationsName
);

notificationsInfo.appendChild(
    notificationsSubtitle
);

const notificationsAction =
    document.createElement("button");

notificationsAction.type = "button";

notificationsAction.className =
    "personal-ai-settings-action";

const updateNotificationsAction =
    () => {
        notificationsAction.textContent =
            notificationsEnabled
                ? "On"
                : "Off";
    };

updateNotificationsAction();

notificationsAction.addEventListener(
    "click",
    async () => {

        notificationsEnabled =
            !notificationsEnabled;

        localStorage.setItem(
            "personalAI_notifications",
            String(
                notificationsEnabled
            )
        );

        if (notificationsEnabled) {
            await requestNotificationPermission();
        }

        updateNotificationsAction();
    }
);

notificationsRow.appendChild(
    notificationsInfo
);

notificationsRow.appendChild(
    notificationsAction
);

chatSection.appendChild(
    notificationsRow
);

const privateModeRow =
    document.createElement("div");

privateModeRow.className =
    "personal-ai-settings-row";

const privateModeInfo =
    document.createElement("div");

privateModeInfo.className =
    "personal-ai-settings-row-main";

const privateModeName =
    document.createElement("div");

privateModeName.className =
    "personal-ai-settings-row-title";

privateModeName.innerHTML = `
    <svg class="settings-row-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="11" rx="2"/>
        <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
    </svg>
    <span>Private Mode</span>
`;

const privateModeSubtitle =
    document.createElement("div");

privateModeSubtitle.className =
    "personal-ai-settings-row-subtitle";

privateModeSubtitle.textContent =
    "Don't save new messages to chat history.";

privateModeInfo.appendChild(
    privateModeName
);

privateModeInfo.appendChild(
    privateModeSubtitle
);

const privateModeAction =
    document.createElement("button");

privateModeAction.type = "button";

privateModeAction.className =
    "personal-ai-settings-action";

const updatePrivateModeAction =
    () => {

        privateModeAction.textContent =
            privateModeEnabled
                ? "On"
                : "Off";
    };

updatePrivateModeAction();

privateModeAction.addEventListener(
    "click",
    () => {

        privateModeEnabled =
            !privateModeEnabled;

        localStorage.setItem(
            "personalAI_privateMode",
            String(privateModeEnabled)
        );

        updatePrivateModeAction();
        updatePrivateModeButton();

        if (privateModeEnabled) {
            setCurrentChat(null);

            conversationHistory = [];

            updateContextIndicator();

            renderMessages(null);
        }
    }
);

privateModeRow.appendChild(
    privateModeInfo
);

privateModeRow.appendChild(
    privateModeAction
);

chatSection.appendChild(
    privateModeRow
);

const webSearchRow =
    document.createElement("div");

webSearchRow.className =
    "personal-ai-settings-row";

const webSearchInfo =
    document.createElement("div");

webSearchInfo.className =
    "personal-ai-settings-row-main";

const webSearchName =
    document.createElement("div");

webSearchName.className =
    "personal-ai-settings-row-title";

webSearchName.textContent =
    "🌐 Web Search";

const webSearchSubtitle =
    document.createElement("div");

webSearchSubtitle.className =
    "personal-ai-settings-row-subtitle";

webSearchSubtitle.textContent =
    "Search the web for up-to-date information.";

webSearchInfo.appendChild(
    webSearchName
);

webSearchInfo.appendChild(
    webSearchSubtitle
);

const webSearchAction =
    document.createElement("button");

webSearchAction.type = "button";

webSearchAction.className =
    "personal-ai-settings-action";

const updateWebSearchAction =
    () => {
        webSearchAction.textContent =
            webSearchEnabled
                ? "On"
                : "Off";
    };

updateWebSearchAction();

webSearchAction.addEventListener(
    "click",
    () => {

        webSearchEnabled =
            !webSearchEnabled;

        localStorage.setItem(
            "personalAI_webSearch",
            String(webSearchEnabled)
        );

        updateWebSearchAction();

        if (typeof updateWebSearchButton === "function") {
            updateWebSearchButton();
        }
    }
);

webSearchRow.appendChild(
    webSearchInfo
);

webSearchRow.appendChild(
    webSearchAction
);

chatSection.appendChild(
    webSearchRow
);

const accountSection =
    document.createElement("div");

accountSection.className =
    "personal-ai-settings-section";

const accountTitle =
    document.createElement("div");

accountTitle.className =
    "personal-ai-settings-section-title";

accountTitle.textContent =
    "Account";

const accountRow =
    document.createElement("div");

accountRow.className =
    "personal-ai-settings-row";

const accountMain =
    document.createElement("div");

accountMain.className =
    "personal-ai-settings-row-main";

const accountRowTitle =
    document.createElement("div");

accountRowTitle.className =
    "personal-ai-settings-row-title";

accountRowTitle.textContent =
    "👤 Account";

const accountRowSubtitle =
    document.createElement("div");

accountRowSubtitle.className =
    "personal-ai-settings-row-subtitle";

accountRowSubtitle.textContent =
    "You are currently logged in.";

accountMain.appendChild(accountRowTitle);
accountMain.appendChild(accountRowSubtitle);

const accountLogout =
    document.createElement("button");

accountLogout.className =
    "personal-ai-settings-action";

accountLogout.textContent =
    "🚪 Logout";

accountLogout.addEventListener(
    "click",
    () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to logout?"
            );

        if (!confirmed) {
            return;
        }

        const logoutBtn =
            document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.click();
        }
    }
);

accountRow.appendChild(accountMain);
accountRow.appendChild(accountLogout);

accountSection.appendChild(accountTitle);
accountSection.appendChild(accountRow);

/* =========================================================
   ABOUT APP
   ========================================================= */

const aboutSection =
    document.createElement("div");

aboutSection.className =
    "personal-ai-settings-section personal-ai-about-section";

const aboutTitle =
    document.createElement("div");

aboutTitle.className =
    "personal-ai-settings-section-title";
aboutTitle.textContent = "About";

const aboutRow =
    document.createElement("div");

aboutRow.className =
    "personal-ai-settings-row";

const aboutMain =
    document.createElement("div");

aboutMain.className =
    "personal-ai-settings-row-main";

const aboutRowTitle =
    document.createElement("div");

aboutRowTitle.className =
    "personal-ai-settings-row-title";
aboutRowTitle.textContent = "ℹ️ About App";

const aboutRowSubtitle =
    document.createElement("div");

aboutRowSubtitle.className =
    "personal-ai-settings-row-subtitle";
aboutRowSubtitle.textContent =
    "App information and version details.";

aboutMain.appendChild(aboutRowTitle);
aboutMain.appendChild(aboutRowSubtitle);

const aboutAction =
    document.createElement("button");

aboutAction.type = "button";
aboutAction.className =
    "personal-ai-settings-action";
aboutAction.textContent = "View";

aboutAction.addEventListener(
    "click",
    () => {

        const existingAbout =
            document.getElementById(
                "personal-ai-about-overlay"
            );

        if (existingAbout) {
            existingAbout.remove();
        }

        const aboutOverlay =
            document.createElement("div");

        aboutOverlay.id =
            "personal-ai-about-overlay";
        aboutOverlay.className =
            "personal-ai-about-overlay";

        const aboutCard =
            document.createElement("div");
        aboutCard.className =
            "personal-ai-about-card";

        const aboutHead =
            document.createElement("div");
        aboutHead.className =
            "personal-ai-about-head";

        const aboutHeading =
            document.createElement("div");
        aboutHeading.className =
            "personal-ai-about-heading";
        aboutHeading.textContent =
            "ℹ️ About MS GPT";

        const aboutClose =
            document.createElement("button");
        aboutClose.type = "button";
        aboutClose.className =
            "personal-ai-about-close";
        aboutClose.textContent = "✕";
        aboutClose.title = "Close";

        const closeAbout =
            () => aboutOverlay.remove();

        aboutClose.addEventListener(
            "click",
            closeAbout
        );

        aboutOverlay.addEventListener(
            "click",
            event => {
                if (event.target === aboutOverlay) {
                    closeAbout();
                }
            }
        );

        aboutHead.appendChild(aboutHeading);
        aboutHead.appendChild(aboutClose);

        const aboutBrand =
            document.createElement("div");
        aboutBrand.className =
            "personal-ai-about-brand";
        aboutBrand.textContent = "MS GPT";

        const aboutSubtitle =
            document.createElement("div");
        aboutSubtitle.className =
            "personal-ai-about-subtitle";
        aboutSubtitle.textContent =
            "Your Personal AI Assistant";

        const aboutDetails =
            document.createElement("div");
        aboutDetails.className =
            "personal-ai-about-details";

        const aboutVersion =
            document.createElement("div");
        aboutVersion.innerHTML =
            "<span>📦 App Version</span><strong>v1.0.0</strong>";

        const aboutDeveloper =
            document.createElement("div");
        aboutDeveloper.innerHTML =
            "<span>👨‍💻 Developer</span><strong>Mesbaul Islam</strong>";

        const aboutCopyright =
            document.createElement("div");
        aboutCopyright.innerHTML =
            "<span>©️ Copyright</span><strong>© 2026 MS GPT. All rights reserved.</strong>";

        aboutDetails.appendChild(aboutVersion);
        aboutDetails.appendChild(aboutDeveloper);
        aboutDetails.appendChild(aboutCopyright);

        aboutCard.appendChild(aboutHead);
        aboutCard.appendChild(aboutBrand);
        aboutCard.appendChild(aboutSubtitle);
        aboutCard.appendChild(aboutDetails);

        aboutOverlay.appendChild(aboutCard);
        document.body.appendChild(aboutOverlay);

        aboutClose.focus();
    }
);

aboutRow.appendChild(aboutMain);
aboutRow.appendChild(aboutAction);

aboutSection.appendChild(aboutTitle);
aboutSection.appendChild(aboutRow);

    panel.appendChild(head);
    panel.appendChild(appearanceSection);
    panel.appendChild(chatSection);
    panel.appendChild(accountSection);
    panel.appendChild(aboutSection);

    settingsPanel.appendChild(panel);

    settingsPanel.addEventListener(
        "click",
        closeSettingsPanel
    );

    document.body.appendChild(
        settingsPanel
    );

    document.body.style.overflow =
        "hidden";

    closeBtn.focus();
}


if (themeBtn) {

    themeBtn.innerHTML = `
        <svg class="bottom-action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5l1.2 1.8 2.2.6 2-.9 1.6 1.6-.9 2 .6 2.2L20.5 12l-1.8 1.2-.6 2.2.9 2-1.6 1.6-2-.9-2.2.6L12 20.5l-1.2-1.8-2.2-.6-2 .9L5 17.4l.9-2-.6-2.2L3.5 12l1.8-1.2.6-2.2L5 6.6 6.6 5l2 .9 2.2-.6z"/>
            <circle cx="12" cy="12" r="2.8"/>
        </svg>
        <span>Settings</span>
    `;

    themeBtn.title =
        "Open Settings";

    themeBtn.addEventListener(
        "click",
        openSettingsPanel
    );
}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            settingsPanel
        ) {
            closeSettingsPanel();
        }
    }
);


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
const mainLogoutBtn =
    document.getElementById("logoutBtn");

if (mainLogoutBtn) {
    mainLogoutBtn.style.display = "none";
}

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
        updateContextIndicator();

            localStorage.removeItem(
                "personalAI_currentChat"
            );
        }
    );
}
/* =========================================================
   EXPORT CHAT
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const exportButton =
            event.target.closest("#exportChatBtn");

        if (!exportButton) {
            return;
        }

        if (!conversationHistory.length) {
            alert("এই chat-এ কোনো message নেই।");
            return;
        }

        let text =
            "Personal AI Chat Export\n";

        text +=
            "========================\n\n";

        conversationHistory.forEach(
            message => {

                const role =
                    message.role === "user"
                        ? "You"
                        : "Personal AI";

                text +=
                    role + ":\n";

                text +=
                    (message.content || "") +
                    "\n\n";
            }
        );

        const blob =
            new Blob(
                [text],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "personal-ai-chat.txt";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }
);

    if (app) {
        app.style.display = "none";
    }



function cacheChats() {
    try {
        /* Private chats must never enter localStorage. */
        const cleanChats = chats
            .filter(
                chat =>
                    !String(chat.id).startsWith(
                        "private-"
                    )
            )
            .map(chat => ({
                id: chat.id,
                title: chat.title,
                pinned: Number(chat.pinned) || 0,
                folder_id: chat.folder_id ?? null,
                messages: (chat.messages || []).map(item => ({
                    role: item.role,
                    content: item.content,
                    created_at:
                        item.created_at || null
                }))
            }));

        localStorage.setItem(
            "personalAI_chats",
            JSON.stringify(cleanChats)
        );

        if (
            currentChatId !== null &&
            currentChatId !== undefined &&
            !String(currentChatId).startsWith("private-")
        ) {
            localStorage.setItem(
                "personalAI_currentChat",
                String(currentChatId)
            );
        } else {
            localStorage.removeItem(
                "personalAI_currentChat"
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
            ? data.filter(
                chat =>
                    !String(chat.id).startsWith(
                        "private-"
                    )
            )
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

    if (
        currentChatId === null ||
        String(currentChatId).startsWith("private-")
    ) {
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
function showServerLoading() {
    const loader =
        document.getElementById("serverLoading");

    if (loader) {
        loader.style.display = "flex";
    }
}


function hideServerLoading() {
    const loader =
        document.getElementById("serverLoading");

    if (loader) {
        loader.style.display = "none";
    }
}
async function apiRequest(
    path,
    options = {}
) {
    let loadingTimer = null;

    try {
        const controller =
            new AbortController();

        const requestOptions = {
            credentials: "include",
            ...options,
            signal: controller.signal
        };

        loadingTimer = setTimeout(
            () => {
                showServerLoading();
            },
            2500
        );

        const response =
            await fetch(
                `${API_BASE}${path}`,
                requestOptions
            );

        clearTimeout(loadingTimer);
        hideServerLoading();

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

    } catch (error) {
        if (loadingTimer) {
            clearTimeout(loadingTimer);
        }

        hideServerLoading();

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

        .folder-section {
            margin: 12px 12px 8px;
        }

        .folder-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 8px;
            color: var(--text);
            font-size: 13px;
            font-weight: 600;
            opacity: 0.85;
        }

        .folder-add-btn {
            width: 28px;
            height: 28px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--card);
            color: var(--text);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .folder-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .folder-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px 10px;
            border: 1px solid transparent;
            border-radius: 9px;
            background: transparent;
            color: var(--text);
            cursor: pointer;
            box-sizing: border-box;
        }

        .folder-item:hover,
        .folder-item.active {
            background: var(--hover);
            border-color: var(--border);
        }

        .folder-item-name {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: left;
            font-size: 14px;
            border: 0;
            background: transparent;
            color: inherit;
            cursor: pointer;
            padding: 0;
        }

        .folder-item-actions {
            display: flex;
            align-items: center;
            gap: 2px;
            flex-shrink: 0;
        }

        .folder-action-btn {
            width: 26px;
            height: 26px;
            border: none;
            border-radius: 7px;
            background: transparent;
            color: var(--text);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        }

        .folder-action-btn:hover {
            background: var(--hover);
            opacity: 1;
        }

        .personal-ai-folder-picker {
            position: fixed;
            z-index: 5000;
            width: 190px;
            max-height: 320px;
            overflow-y: auto;
            padding: 6px;
            box-sizing: border-box;
            background: var(--card);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 12px;
            box-shadow: 0 12px 35px rgba(0,0,0,0.28);
        }

        .personal-ai-folder-picker-title {
            padding: 7px 9px;
            font-size: 12px;
            opacity: 0.65;
        }

        .personal-ai-folder-picker-item {
            width: 100%;
            padding: 9px 10px;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: var(--text);
            text-align: left;
            cursor: pointer;
            font-size: 13px;
        }

        .personal-ai-folder-picker-item:hover,
        .personal-ai-folder-picker-item.active {
            background: var(--hover);
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

        .message-text {
    font-size: var(--chat-font-size) !important;
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

                await loadFolders();
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
                    folder_id:
                        chat.folder_id ?? null,
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

            updateContextIndicator();

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
                updateContextIndicator();

            renderMessages(
                target
            );
            updateContextIndicator();

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
                folder_id:
                    created.chat.folder_id ?? null,
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

    /* -----------------------------------------
       PRIVATE MODE
       ----------------------------------------- */

    if (privateModeEnabled) {

    const privateChat = {
        id:
            "private-" +
            Date.now(),

        title:
            title.trim() ||
            "Private Chat",

        pinned: 0,

        folder_id: null,

        messages: []
    };

    chats.unshift(
        privateChat
    );

    setCurrentChat(
        privateChat.id
    );

    conversationHistory = [];

    updateContextIndicator();

    renderMessages(
        privateChat
    );

    return privateChat;
}


    /* -----------------------------------------
       NORMAL CLOUD CHAT
       ----------------------------------------- */

    try {

        const data =
            await apiRequest(
                "/chats",
                {
                    method: "POST",

                    body: makeFormData({
                        title:
                            title.trim() ||
                            "New Chat",

                        ...(currentFolderId !== null &&
                        currentFolderId !== "none" &&
                        Number.isFinite(
                            Number(
                                currentFolderId
                            )
                        )
                            ? {
                                folder_id:
                                    String(
                                        currentFolderId
                                    )
                            }
                            : {})
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

            id:
                remote.id,

            title:
                remote.title ||
                "New Chat",

            pinned:
                Number(
                    remote.pinned
                ) || 0,

            folder_id:
                remote.folder_id ??
                null,

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

        updateContextIndicator();

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

        if (
            String(chat.id).startsWith(
                "private-"
            )
        ) {
            chat.messages =
                Array.isArray(chat.messages)
                    ? chat.messages
                    : [];
        } else {

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
                            role:
                                item.role,
                            content:
                                item.content,
                            created_at:
                                item.created_at
                        })
                    )
                    : [];
        }

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
        updateContextIndicator();

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
   STEP 9 — SIDEBAR ICONS + ACTION MENUS
   ========================================================= */

let sidebarActionMenu = null;

function sidebarIcon(name, className = "sidebar-menu-icon") {
    const paths = {
        pin: '<path d="M8 4l8 8"/><path d="M9 3l6 6"/><path d="M6 8l10 10"/><path d="M7 17l-3 3"/><path d="M10 14l-5 5"/>',
        folder: '<path d="M3.5 7.5h6l1.8 2h9.2v8.5a2 2 0 0 1-2 2h-15z"/><path d="M3.5 7.5v-.8a1.7 1.7 0 0 1 1.7-1.7h4.2l1.8 2"/>',
        rename: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 7.5l3 3"/>',
        delete: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/>',
        more: '<circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
        chat: '<path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/>',
        star: '<path d="m12 4 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z"/>',
        unpin: '<path d="M7 5l10 10"/><path d="M16 3l5 5-3 1-4 4-4 4-3 1 1-3 4-4 4-4z"/><path d="M4 20l3-3"/>',
        check: '<path d="m5 12 4 4L19 6"/>',
        back: '<path d="M15 6l-6 6 6 6"/>',
    };
    // SVG elements must be created in the SVG namespace. Creating an
    // "svg" tag with document.createElement() gives it the HTML namespace,
    // so its path/circle children may not render in the collapsed sidebar.
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );
    svg.classList.add(...String(className).split(/\s+/).filter(Boolean));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paths[name] || paths.more;
    return svg;
}

function closeSidebarActionMenu() {
    if (sidebarActionMenu) {
        sidebarActionMenu.remove();
        sidebarActionMenu = null;
    }
}

function placeSidebarActionMenu(menu, anchor) {
    const rect = anchor.getBoundingClientRect();
    const menuWidth = 188;
    const gap = 7;
    let left = rect.right - menuWidth;
    if (left < 8) left = 8;
    let top = rect.bottom + gap;
    const height = Math.min(menu.offsetHeight || 220, 260);
    if (top + height > window.innerHeight - 8) {
        top = Math.max(8, rect.top - height - gap);
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function makeSidebarMenuItem(icon, label, onClick, danger = false) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `sidebar-action-menu-item${danger ? ' danger' : ''}`;
    item.appendChild(sidebarIcon(icon));
    const text = document.createElement('span');
    text.textContent = label;
    item.appendChild(text);
    item.addEventListener('click', async event => {
        event.stopPropagation();
        closeSidebarActionMenu();
        await onClick();
    });
    return item;
}

function openChatActionMenu(chat, anchor) {
    closeSidebarActionMenu();

    const menu = document.createElement('div');
    menu.className = 'sidebar-action-menu';
    menu.setAttribute('role', 'menu');

    menu.appendChild(makeSidebarMenuItem(
        Number(chat.pinned) ? 'unpin' : 'pin',
        Number(chat.pinned) ? 'Unpin' : 'Pin',
        () => togglePin(chat)
    ));

    menu.appendChild(makeSidebarMenuItem(
        'folder',
        'Move to Project',
        () => openFolderPicker(chat, anchor)
    ));

    menu.appendChild(makeSidebarMenuItem(
        'rename',
        'Rename',
        () => renameChat(chat)
    ));

    menu.appendChild(makeSidebarMenuItem(
        'delete',
        'Delete',
        () => deleteChat(chat),
        true
    ));

    document.body.appendChild(menu);
    sidebarActionMenu = menu;
    placeSidebarActionMenu(menu, anchor);
}

document.addEventListener('click', event => {
    if (sidebarActionMenu && !sidebarActionMenu.contains(event.target) && !event.target.closest('.chat-more-btn')) {
        closeSidebarActionMenu();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSidebarActionMenu();
});

/* =========================================================
   RENDER CHAT LIST
   ========================================================= */

function renderChatList(
    sourceChats = chats
) {

    if (!chatList || !pinnedList) {
        return;
    }

    closeSidebarActionMenu();
    pinnedList.innerHTML = "";
    chatList.innerHTML = "";

    let list =
        Array.isArray(sourceChats)
            ? sourceChats.filter(
                chat =>
                    !String(chat.id).startsWith(
                        "private-"
                    )
            )
            : [];

    if (currentFolderId === null) {
        list = list.filter(
            chat =>
                chat.folder_id === null ||
                chat.folder_id === undefined
        );
    } else if (currentFolderId === "none") {
        list = list.filter(
            chat =>
                chat.folder_id === null ||
                chat.folder_id === undefined
        );
    } else {
        list = list.filter(
            chat =>
                String(chat.folder_id) ===
                String(currentFolderId)
        );
    }

    const isAllChats = currentFolderId === null;

    if (recentsLabel) {
        recentsLabel.textContent =
            isAllChats ? "Recents" : "Project Chats";
    }

    const pinned =
        isAllChats
            ? list.filter(chat => Number(chat.pinned) === 1)
            : [];

    const recents =
        isAllChats
            ? list.filter(chat => Number(chat.pinned) !== 1)
            : list;

    if (pinnedSection) {
        pinnedSection.hidden = pinned.length === 0;
    }

    function appendChatRow(target, chat) {
        const row = document.createElement("div");
        row.className = "v21-chat-row";

        const button = document.createElement("button");
        button.type = "button";
        button.className =
            "history-item" +
            (
                String(chat.id) === String(currentChatId)
                    ? " active"
                    : ""
            );
        button.title = chat.title || "New Chat";

        const titleWrap = document.createElement("span");
        titleWrap.className = "history-title-wrap";
        titleWrap.appendChild(
            sidebarIcon("chat", "history-chat-icon")
        );

        const titleText = document.createElement("span");
        titleText.className = "history-title-text";
        titleText.textContent = chat.title || "New Chat";
        titleWrap.appendChild(titleText);
        button.appendChild(titleWrap);

        button.addEventListener(
            "click",
            () => openChat(chat.id)
        );

        const moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.className = "chat-more-btn";
        moreBtn.title = "Chat actions";
        moreBtn.setAttribute(
            "aria-label",
            `Actions for ${chat.title || "New Chat"}`
        );
        moreBtn.appendChild(
            sidebarIcon("more", "chat-more-icon")
        );

        moreBtn.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                if (
                    sidebarActionMenu &&
                    sidebarActionMenu.contains(event.target)
                ) {
                    return;
                }
                openChatActionMenu(chat, moreBtn);
            }
        );

        row.appendChild(button);
        row.appendChild(moreBtn);
        target.appendChild(row);
    }

    pinned.forEach(chat => {
        appendChatRow(pinnedList, chat);
    });

    if (!recents.length) {
        const empty = document.createElement("div");
        empty.className = "v21-empty-history";
        empty.textContent =
            isAllChats
                ? "No recent chats"
                : "No chats in this project";
        chatList.appendChild(empty);
    } else {
        recents.forEach(chat => {
            appendChatRow(chatList, chat);
        });
    }
}

/* =========================================================
   CHAT FOLDERS
   ========================================================= */

function closeFolderPicker() {
    if (folderPicker) {
        folderPicker.remove();
        folderPicker = null;
    }
}

function openFolderPicker(chat, anchor) {
    closeFolderPicker();

    if (!folders.length) {
        alert("আগে একটি folder তৈরি করো।");
        return;
    }

    folderPicker =
        document.createElement("div");

    folderPicker.className =
        "personal-ai-folder-picker";

    const title =
        document.createElement("div");

    title.className =
        "personal-ai-folder-picker-title";

    title.textContent =
        "Move to Folder";

    folderPicker.appendChild(title);

    const currentFolder =
        chat.folder_id === null ||
        chat.folder_id === undefined
            ? null
            : String(chat.folder_id);

    folders.forEach(folder => {
        const item =
            document.createElement("button");

        item.type = "button";
        item.className =
            "personal-ai-folder-picker-item";
        item.appendChild(sidebarIcon('folder', 'folder-picker-icon'));
        const itemText = document.createElement('span');
        itemText.textContent = folder.name;
        item.appendChild(itemText);

        if (
            String(folder.id) ===
            currentFolder
        ) {
            item.classList.add("active");
        }

        item.addEventListener(
            "click",
            async () => {
                closeFolderPicker();
                await moveChatToFolder(
                    chat,
                    folder.id
                );
            }
        );

        folderPicker.appendChild(item);
    });

    /* Remove from current folder */
    if (currentFolder !== null) {
        const removeFolder =
            document.createElement("button");

        removeFolder.type = "button";
        removeFolder.className =
            "personal-ai-folder-picker-item";
        removeFolder.appendChild(sidebarIcon('back', 'folder-picker-icon'));
        const removeText = document.createElement('span');
        removeText.textContent = "Remove from Project";
        removeFolder.appendChild(removeText);

        removeFolder.addEventListener(
            "click",
            async () => {
                closeFolderPicker();
                await moveChatToFolder(
                    chat,
                    null
                );
            }
        );

        folderPicker.appendChild(removeFolder);
    }

    document.body.appendChild(folderPicker);

    const rect =
        anchor.getBoundingClientRect();

    const pickerWidth = 190;

    let left =
        rect.right + 8;

    if (
        left + pickerWidth >
        window.innerWidth - 10
    ) {
        left =
            rect.left - pickerWidth - 8;
    }

    let top =
        rect.top;

    const pickerHeight =
        Math.min(
            folderPicker.offsetHeight,
            320
        );

    if (
        top + pickerHeight >
        window.innerHeight - 10
    ) {
        top =
            window.innerHeight -
            pickerHeight - 10;
    }

    folderPicker.style.left =
        `${Math.max(10, left)}px`;

    folderPicker.style.top =
        `${Math.max(10, top)}px`;
}

async function moveChatToFolder(
    chat,
    folderId
) {

    try {
        const formData =
            new FormData();

        if (folderId !== null) {
            formData.append(
                "folder_id",
                String(folderId)
            );
        }

        const data =
            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/folder`,
                {
                    method: "PATCH",
                    body: formData
                }
            );

        const updated =
            data.chat || {};

        chat.folder_id =
            updated.folder_id ?? folderId;

        cacheChats();
        renderFolders();
        renderChatList();

    } catch (error) {
        console.error(
            "Move chat to folder error:",
            error
        );

        alert(
            error.message ||
            "Chat folder-এ নেওয়া যায়নি।"
        );
    }
}

async function loadFolders() {

    if (!folderList) {
        return;
    }

    try {
        const data =
            await apiRequest("/folders");

        folders =
            Array.isArray(data.folders)
                ? data.folders
                : [];

        renderFolders();

    } catch (error) {
        console.error(
            "Failed to load folders:",
            error
        );
    }
}

function renderFolders() {

    if (!folderList) {
        return;
    }

    closeSidebarActionMenu();
    folderList.innerHTML = "";

    const allItem = document.createElement("button");
    allItem.type = "button";
    allItem.className =
        "folder-item" +
        (currentFolderId === null ? " active" : "");

    const allName = document.createElement('span');
    allName.className = 'folder-item-name';
    allName.appendChild(sidebarIcon('chat', 'folder-item-icon'));
    const allText = document.createElement('span');
    allText.textContent = 'All Chats';
    allName.appendChild(allText);
    allItem.appendChild(allName);

    allItem.addEventListener("click", () => {
        currentFolderId = null;
        closeFolderPicker();
        renderFolders();
        renderChatList();
    });
    folderList.appendChild(allItem);

    folders.forEach(folder => {
        const item = document.createElement("div");
        item.className =
            "folder-item" +
            (
                String(folder.id) === String(currentFolderId)
                    ? " active"
                    : ""
            );

        const name = document.createElement("button");
        name.type = "button";
        name.className = "folder-item-name";
        name.title = folder.name;
        name.appendChild(sidebarIcon('folder', 'folder-item-icon'));
        const text = document.createElement('span');
        text.textContent = folder.name;
        name.appendChild(text);
        name.addEventListener("click", () => {
            currentFolderId = folder.id;
            closeFolderPicker();
            renderFolders();
            renderChatList();
        });

        const moreBtn = document.createElement('button');
        moreBtn.type = 'button';
        moreBtn.className = 'folder-more-btn';
        moreBtn.title = 'Project actions';
        moreBtn.setAttribute('aria-label', `Actions for ${folder.name}`);
        moreBtn.appendChild(sidebarIcon('more', 'folder-more-icon'));
        moreBtn.addEventListener('click', event => {
            event.stopPropagation();
            closeSidebarActionMenu();
            const menu = document.createElement('div');
            menu.className = 'sidebar-action-menu project-action-menu';
            menu.setAttribute('role', 'menu');
            menu.appendChild(makeSidebarMenuItem('rename', 'Rename Project', () => renameFolder(folder)));
            menu.appendChild(makeSidebarMenuItem('delete', 'Delete Project', () => deleteFolder(folder), true));
            document.body.appendChild(menu);
            sidebarActionMenu = menu;
            placeSidebarActionMenu(menu, moreBtn);
        });

        item.appendChild(name);
        item.appendChild(moreBtn);
        folderList.appendChild(item);
    });
}

async function createFolder() {

    const name =
        window.prompt("Folder name:");

    if (!name || !name.trim()) {
        return;
    }

    try {
        await apiRequest(
            "/folders",
            {
                method: "POST",
                body: makeFormData({
                    name: name.trim()
                })
            }
        );

        await loadFolders();

    } catch (error) {
        console.error(
            "Create folder error:",
            error
        );

        alert(
            error.message ||
            "Folder তৈরি করা যায়নি।"
        );
    }
}

async function renameFolder(folder) {

    const name =
        window.prompt(
            "Folder name:",
            folder.name || ""
        );

    if (name === null) {
        return;
    }

    if (!name.trim()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                `/folders/${encodeURIComponent(folder.id)}/rename`,
                {
                    method: "PATCH",
                    body: makeFormData({
                        name: name.trim()
                    })
                }
            );

        const updated =
            data.folder || {};

        folder.name =
            updated.name ||
            name.trim();

        renderFolders();

    } catch (error) {
        console.error(
            "Rename folder error:",
            error
        );

        alert(
            error.message ||
            "Folder rename করা যায়নি।"
        );
    }
}

async function deleteFolder(folder) {

    const confirmed =
        window.confirm(
            `"${folder.name}" folder delete করতে চাও?\n\nFolder-এর chat delete হবে না।`
        );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(
            `/folders/${encodeURIComponent(folder.id)}`,
            {
                method: "DELETE"
            }
        );

        chats.forEach(chat => {
            if (
                String(chat.folder_id) ===
                String(folder.id)
            ) {
                chat.folder_id = null;
            }
        });

        if (
            String(currentFolderId) ===
            String(folder.id)
        ) {
            currentFolderId = null;
        }

        folders =
            folders.filter(
                item =>
                    String(item.id) !==
                    String(folder.id)
            );

        cacheChats();
        renderFolders();
        renderChatList();

    } catch (error) {
        console.error(
            "Delete folder error:",
            error
        );

        alert(
            error.message ||
            "Folder delete করা যায়নি।"
        );
    }
}

if (newFolderBtn) {
    newFolderBtn.addEventListener(
        "click",
        createFolder
    );
}

document.addEventListener(
    "click",
    event => {
        if (
            folderPicker &&
            !folderPicker.contains(event.target) &&
            !event.target.closest("[title='Move to Folder']")
        ) {
            closeFolderPicker();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape") {
            closeFolderPicker();
        }
    }
);


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
                updateContextIndicator();
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
                    Ask anything, get help, or start creating.
                </p>

                <div class="welcome-suggestions">
                    <button type="button" class="welcome-suggestion" data-prompt="Explain something to me simply">
                        <span class="welcome-suggestion-icon">✦</span>
                        <span>Explain something</span>
                    </button>

                    <button type="button" class="welcome-suggestion" data-prompt="Help me write something">
                        <span class="welcome-suggestion-icon">✎</span>
                        <span>Write something</span>
                    </button>

                    <button type="button" class="welcome-suggestion" data-prompt="Help me with some code">
                        <span class="welcome-suggestion-icon">&lt;/&gt;</span>
                        <span>Help with code</span>
                    </button>

                    <button type="button" class="welcome-suggestion" data-prompt="Give me some creative ideas">
                        <span class="welcome-suggestion-icon">✧</span>
                        <span>Brainstorm ideas</span>
                    </button>
                </div>
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
    item.imageUrl || null,
    false,
    item.created_at || null
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
        aiMessage.role !== "assistant"
    ) {
        return;
    }

    if (
        !privateModeEnabled &&
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
regenerateBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8 8 0 0 0-14.9-3"></path>
        <path d="M5 4v4h4"></path>
        <path d="M4 13a8 8 0 0 0 14.9 3"></path>
        <path d="M19 20v-4h-4"></path>
    </svg>
    <span>Regenerating...</span>
`;
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

        formData.append(
            "use_web_search",
            String(webSearchEnabled)
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

        if (
            !privateModeEnabled &&
            aiMessage &&
            aiMessage.id
        ) {
            await apiRequest(
                `/chats/${encodeURIComponent(chat.id)}/messages/${encodeURIComponent(aiMessage.id)}`,
                {
                    method: "DELETE"
                }
            );
        }

        /* -----------------------------------------
           SAVE NEW AI MESSAGE
           ----------------------------------------- */

        let savedAssistant = null;

        if (!privateModeEnabled) {

            savedAssistant =
                await saveMessageToCloud(
                    chat.id,
                    "assistant",
                    aiReply
                );
        }

        const newMessage =
            savedAssistant &&
            savedAssistant.message
                ? savedAssistant.message
                : null;

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
            updateContextIndicator();

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

    regenerateBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.9-3"></path>
            <path d="M5 4v4h4"></path>
            <path d="M4 13a8 8 0 0 0 14.9 3"></path>
            <path d="M19 20v-4h-4"></path>
        </svg>
        <span>Regenerate</span>
    `;
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

    regenerateBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.9-3"></path>
            <path d="M5 4v4h4"></path>
            <path d="M4 13a8 8 0 0 0 14.9 3"></path>
            <path d="M19 20v-4h-4"></path>
        </svg>
        <span>Regenerate</span>
    `;
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
    shouldScroll = true,
    createdAt = null
) {

    if (!createdAt) {
        createdAt =
            new Date().toISOString();
    }
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
                        : "MS GPT"
                }
            </div>

            <div class="message-text"></div>
            <div class="message-timestamp"></div>
                        ${
                type === "ai"
                    ? `
<div class="ai-message-actions">

    <button
        class="copy-message-btn message-action-btn"
        type="button"
        title="Copy"
        aria-label="Copy"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="8" y="8" width="11" height="11" rx="2"></rect>
            <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
        </svg>
        <span>Copy</span>
    </button>

    <button
        class="copy-message-btn read-aloud-message-btn message-action-btn"
        type="button"
        title="Read aloud"
        aria-label="Read aloud"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10v4h4l5 4V6L8 10H4z"></path>
            <path d="M16 9a4 4 0 0 1 0 6"></path>
            <path d="M18.5 6.5a8 8 0 0 1 0 11"></path>
        </svg>
        <span>Read</span>
    </button>

    <button
        class="regenerate-message-btn message-action-btn"
        type="button"
        title="Regenerate"
        aria-label="Regenerate"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.9-3"></path>
            <path d="M5 4v4h4"></path>
            <path d="M4 13a8 8 0 0 0 14.9 3"></path>
            <path d="M19 20v-4h-4"></path>
        </svg>
        <span>Regenerate</span>
    </button>

</div>
                    `
                    : `
<div class="user-message-actions">

    <button
        class="edit-message-btn message-action-btn"
        type="button"
        title="Edit message"
        aria-label="Edit message"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4z"></path>
            <path d="m13.5 6.5 4 4"></path>
        </svg>
        <span>Edit</span>
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
const timestampElement =
    message.querySelector(
        ".message-timestamp"
    );

if (timestampElement && createdAt) {

    const date =
        new Date(
            createdAt.replace(" ", "T") + "Z"
        );

    if (!isNaN(date.getTime())) {

        timestampElement.textContent =
            date.toLocaleString(
                "en-US",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                }
            );
    }
}

if (timestampElement) {
    timestampElement.style.display =
        messageTimestampEnabled
            ? ""
            : "none";
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

        const readAloudBtn =
            message.querySelector(
                 ".read-aloud-message-btn"
            );
if (readAloudBtn) {
    readAloudBtn.addEventListener(
        "click",
        () => {
            if (!("speechSynthesis" in window)) {
                alert(
                    "এই browser-এ voice reply support নেই।"
                );
                return;
            }

            speechSynthesis.cancel();

            const utterance =
                new SpeechSynthesisUtterance(
                    text || ""
                );

            utterance.lang = "bn-BD";
            utterance.rate = 1;
            utterance.pitch = 1;

readAloudBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="7" y="7" width="10" height="10" rx="2"></rect>
    </svg>
    <span>Stop</span>
`;

            utterance.onend = () => {
readAloudBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4z"></path>
        <path d="M16 9a4 4 0 0 1 0 6"></path>
        <path d="M18.5 6.5a8 8 0 0 1 0 11"></path>
    </svg>
    <span>Read</span>
`;
            };

            utterance.onerror = () => {
readAloudBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4z"></path>
        <path d="M16 9a4 4 0 0 1 0 6"></path>
        <path d="M18.5 6.5a8 8 0 0 1 0 11"></path>
    </svg>
    <span>Read</span>
`;
            };

            speechSynthesis.speak(
                utterance
            );
        }
    );
}

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

copyBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12 4 4L19 6"></path>
    </svg>
    <span>Copied</span>
`;

                    setTimeout(
                        () => {
copyBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="11" height="11" rx="2"></rect>
        <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
    </svg>
    <span>Copy</span>
`;
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
    applyFontSize();
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
                MS GPT
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

        if (!privateModeEnabled) {

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
        }

        /* -----------------------------------------
   PRIVATE MODE
   ----------------------------------------- */

if (privateModeEnabled) {

    const newUserMessage = {
        id: null,
        chat_id: chat.id,
        role: "user",
        content: originalText
    };

    const newAiMessage = {
        id: null,
        chat_id: chat.id,
        role: "assistant",
        content: aiReply
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
                role: item.role,
                content: item.content
            })
        );

    messageInput.value = "";

    messageInput.style.height =
        "auto";

    renderMessages(chat);

    renderChatList();

    scrollToBottom();

    return;
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
            updateContextIndicator();


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
    !selectedImage &&
    !selectedFile
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

                const isPrivateChat =
                    chat &&
                    String(chat.id).startsWith(
                        "private-"
                    );

                if (
                    privateModeEnabled &&
                    !isPrivateChat
                ) {
                    chat =
                        await createChat(
                            "Private Chat"
                        );
                } else if (
                    !privateModeEnabled &&
                    isPrivateChat
                ) {
                    chat =
                        await createChat(
                            message ||
                            "New Chat"
                        );
                } else if (!chat) {

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
    !privateModeEnabled &&
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
    (
        selectedFile
            ? `📄 ${selectedFile.name}`
            : "Image uploaded"
    );

const aiMessage =
    message ||
    (
        selectedFile
            ? "Please analyze the attached file."
            : ""
    );

                addMessage(
                    "user",
                    userText,
                    imageUrl,
                    true,
                    new Date().toISOString()
                );

                chat.messages =
                    chat.messages || [];

                chat.messages.push({
                    role:
                        "user",
                    content:
                        userText,
                    imageUrl,
                    created_at:
                        new Date().toISOString()
                });

                conversationHistory.push({
                    role:
                        "user",
                    content:
                        userText
                });

                updateContextIndicator();
                let savedUser = null;

if (!privateModeEnabled) {

    savedUser =
        await saveMessageToCloud(
            chat.id,
            "user",
            userText
        );
}

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
let requestHistory =
    conversationHistory.slice(
        0,
        -1
    );

if (selectedFile) {
    requestHistory.push({
        role: "user",
        content:
            `Attached file: ${selectedFile.name}\n\n` +
            selectedFile.text
    });
}

                if (imageToSend) {

                    const formData =
                        new FormData();

                    formData.append(
                        "message",
                        message
                    );

                    formData.append(
    "message",
    aiMessage
);

formData.append(
    "history",
    JSON.stringify(
        requestHistory
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
                         aiMessage
                     );

                    formData.append(
                        "history",
                        JSON.stringify(
                           requestHistory
                        )
                    );

                    formData.append(
                        "use_web_search",
                        String(webSearchEnabled)
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
                    aiReply,
                    null,
                    true,
                    new Date().toISOString()
                );
                showAINotification();

                chat.messages.push({
                    role:
                        "assistant",
                    content:
                        aiReply,
                    created_at:
                        new Date().toISOString()
                });

                conversationHistory.push({
                    role:
                        "assistant",
                    content:
                        aiReply
                });


                updateContextIndicator();

                let savedAssistant = null;

                if (!privateModeEnabled) {
                    savedAssistant =
                        await saveMessageToCloud(
                            chat.id,
                            "assistant",
                            aiReply
                        );
                }

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

                selectedFile = null;

                fileInput.value = "";

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
                !event.shiftKey &&
                enterToSendEnabled
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
async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        return false;
    }

    const permission =
        await Notification.requestPermission();

    return permission === "granted";
}


function showAINotification() {

    if (
        !notificationsEnabled ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    new Notification(
        "Personal AI",
        {
            body:
                "Your AI reply is ready."
        }
    );
}

function scrollToBottom() {

    if (!autoScrollEnabled) {
        return;
    }

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

    await loadFolders();
    await loadCloudChats();
}


/* =========================================================
   START
   ========================================================= */

initializeApp();

