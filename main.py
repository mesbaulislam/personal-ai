import os
import base64
import mimetypes
import json

import httpx
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Cookie,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from itsdangerous import URLSafeSerializer
from pypdf import PdfReader
from docx import Document

# =========================
# ENVIRONMENT
# =========================

load_dotenv(dotenv_path=".env", override=True)

API_KEY = os.getenv("OPENROUTER_API_KEY")
USERNAME = "Mesbaul_AI"
PASSWORD = os.getenv("PERSONAL_AI_PASSWORD")
SESSION_SECRET = os.getenv("SESSION_SECRET")

CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
D1_DATABASE_ID = os.getenv("D1_DATABASE_ID")

if not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET পাওয়া যায়নি।")

serializer = URLSafeSerializer(SESSION_SECRET)


# =========================
# CLOUDFLARE D1
# =========================

D1_API_URL = (
    f"https://api.cloudflare.com/client/v4/accounts/"
    f"{CLOUDFLARE_ACCOUNT_ID}/d1/database/{D1_DATABASE_ID}/query"
)


async def d1_query(sql: str, params=None):
    """Run a parameterized SQL query on Cloudflare D1."""

    if params is None:
        params = []

    if not CLOUDFLARE_API_TOKEN:
        raise RuntimeError("CLOUDFLARE_API_TOKEN পাওয়া যায়নি।")

    if not CLOUDFLARE_ACCOUNT_ID:
        raise RuntimeError("CLOUDFLARE_ACCOUNT_ID পাওয়া যায়নি।")

    if not D1_DATABASE_ID:
        raise RuntimeError("D1_DATABASE_ID পাওয়া যায়নি।")

    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "sql": sql,
        "params": params,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            D1_API_URL,
            headers=headers,
            json=payload,
        )

    response.raise_for_status()

    data = response.json()

    if not data.get("success"):
        raise RuntimeError(
            f"D1 query failed: {data.get('errors')}"
        )

    results = data.get("result", [])

    if not results:
        return {
            "results": [],
            "success": True,
        }

    return results[0]


# =========================
# APP
# =========================

app = FastAPI(title="Personal AI")

# =========================
# FILE TEXT EXTRACTION
# =========================

async def extract_file_text(
    file: UploadFile
):
    filename = (
        file.filename or ""
    ).lower()

    content = await file.read()

    if filename.endswith(".txt"):
        return content.decode(
            "utf-8",
            errors="ignore"
        )

    if filename.endswith(".pdf"):
        import io

        reader = PdfReader(
            io.BytesIO(content)
        )

        pages = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n\n".join(pages)

    if filename.endswith(".docx"):
        import io

        document = Document(
            io.BytesIO(content)
        )

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Supported files: "
            "TXT, PDF, DOCX"
        ),
    )

# =========================
# FRONTEND
# =========================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)


@app.get("/")
async def home():
    return FileResponse("static/index.html")


# =========================
# LOGIN
# =========================

@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
):
    if username != USERNAME or password != PASSWORD:
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "message": "Username অথবা password ভুল।",
            },
        )

    session_token = serializer.dumps({
        "username": USERNAME
    })

    response = JSONResponse({
        "success": True,
        "message": "Login successful",
    })

    response.set_cookie(
        key="personal_ai_session",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return response


# =========================
# CHECK SESSION
# =========================

@app.get("/check-session")
async def check_session(
    personal_ai_session: str = Cookie(default=None),
):
    if not personal_ai_session:
        return {
            "logged_in": False,
        }

    try:
        data = serializer.loads(personal_ai_session)

        if data.get("username") == USERNAME:
            return {
                "logged_in": True,
                "username": USERNAME,
            }

    except Exception:
        pass

    return {
        "logged_in": False,
    }


# =========================
# LOGOUT
# =========================

@app.post("/logout")
async def logout():
    response = JSONResponse({
        "success": True,
        "message": "Logged out",
    })

    response.delete_cookie(
        key="personal_ai_session"
    )

    return response


# =========================
# HEALTH
# =========================

@app.get("/health")
async def health():
    return {
        "status": "ok",
    }


# =========================
# AUTH CHECK
# =========================

def require_login(
    personal_ai_session: str = Cookie(default=None),
):
    if not personal_ai_session:
        raise HTTPException(
            status_code=401,
            detail="Login required",
        )

    try:
        data = serializer.loads(personal_ai_session)

        if data.get("username") != USERNAME:
            raise HTTPException(
                status_code=401,
                detail="Invalid session",
            )

        return data["username"]

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )


@app.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    username: str = Depends(require_login),
):
    filename = (
        file.filename or ""
    ).lower()

    allowed_extensions = (
        ".txt",
        ".pdf",
        ".docx",
    )

    if not filename.endswith(
        allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only TXT, PDF and DOCX "
                "files are supported."
            ),
        )

    text = await extract_file_text(
        file
    )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from the file.",
        )

    max_chars = 30000

    if len(text) > max_chars:
        text = text[:max_chars] + (
            "\n\n[File text truncated]"
        )

    return {
        "success": True,
        "filename": file.filename,
        "text": text,
    }
# =========================
# D1 TEST
# =========================

@app.get("/test-d1")
async def test_d1(
    username: str = Depends(require_login),
):
    result = await d1_query(
        "SELECT name FROM sqlite_master "
        "WHERE type='table' "
        "ORDER BY name"
    )

    return {
        "success": True,
        "tables": result.get("results", []),
    }
# =========================
# CHAT HISTORY API
# =========================

@app.post("/chats")
async def create_chat(
    title: str = Form("New Chat"),
    folder_id: str | None = Form(None),
    username: str = Depends(require_login),
):
    title = (title or "").strip() or "New Chat"

    # folder_id safely convert
    parsed_folder_id = None

    if folder_id is not None:
        folder_id = folder_id.strip()

        if folder_id:
            try:
                parsed_folder_id = int(folder_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid folder ID",
                )

    # If folder_id exists, make sure the folder exists
    if parsed_folder_id is not None:
        folder_result = await d1_query(
            """
            SELECT id
            FROM folders
            WHERE id = ?
            """,
            [parsed_folder_id],
        )

        if not folder_result.get("results", []):
            raise HTTPException(
                status_code=404,
                detail="Folder not found",
            )

    result = await d1_query(
        """
        INSERT INTO chats (
            title,
            folder_id
        )
        VALUES (?, ?)
        RETURNING
            id,
            title,
            pinned,
            folder_id,
            created_at,
            updated_at
        """,
        [
            title,
            parsed_folder_id,
        ],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=500,
            detail="Chat create failed",
        )

    return {
        "success": True,
        "chat": rows[0],
    }
# =========================
# FOLDER API
# =========================
@app.patch("/folders/{folder_id}/rename")
async def rename_folder(
    folder_id: int,
    name: str = Form(...),
    username: str = Depends(require_login),
):
    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Folder name is empty",
        )

    result = await d1_query(
        """
        UPDATE folders
        SET name = ?
        WHERE id = ?
        RETURNING id, name, created_at
        """,
        [name, folder_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Folder not found",
        )

    return {
        "success": True,
        "folder": rows[0],
    }


@app.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: int,
    username: str = Depends(require_login),
):
    existing = await d1_query(
        """
        SELECT id
        FROM folders
        WHERE id = ?
        """,
        [folder_id],
    )

    if not existing.get("results", []):
        raise HTTPException(
            status_code=404,
            detail="Folder not found",
        )

    await d1_query(
        """
        UPDATE chats
        SET folder_id = NULL
        WHERE folder_id = ?
        """,
        [folder_id],
    )

    await d1_query(
        """
        DELETE FROM folders
        WHERE id = ?
        """,
        [folder_id],
    )

    return {
        "success": True,
        "message": "Folder deleted",
    }
    
@app.patch("/chats/{chat_id}/folder")
async def move_chat_to_folder(
    chat_id: int,
    folder_id: int | None = Form(None),
    username: str = Depends(require_login),
):
    if folder_id is not None:
        folder_result = await d1_query(
            """
            SELECT id
            FROM folders
            WHERE id = ?
            """,
            [folder_id],
        )

        if not folder_result.get("results", []):
            raise HTTPException(
                status_code=404,
                detail="Folder not found",
            )

    result = await d1_query(
        """
        UPDATE chats
        SET folder_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING
            id,
            title,
            pinned,
            folder_id,
            created_at,
            updated_at
        """,
        [folder_id, chat_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "success": True,
        "chat": rows[0],
    }

@app.post("/folders")
async def create_folder(
    name: str = Form(...),
    username: str = Depends(require_login),
):
    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Folder name is empty",
        )

    result = await d1_query(
        """
        INSERT INTO folders (name)
        VALUES (?)
        RETURNING id, name, created_at
        """,
        [name],
    )

    return {
        "success": True,
        "folder": result.get("results", [])[0],
    }


@app.get("/folders")
async def get_folders(
    username: str = Depends(require_login),
):
    result = await d1_query(
        """
        SELECT
            id,
            name,
            created_at
        FROM folders
        ORDER BY created_at ASC
        """
    )

    return {
        "success": True,
        "folders": result.get("results", []),
    }

@app.get("/chats")
async def get_chats(
    username: str = Depends(require_login),
):
    result = await d1_query(
        """
        SELECT
            id,
            title,
            pinned,
            folder_id,
            created_at,
            updated_at
        FROM chats
        ORDER BY pinned DESC, updated_at DESC
        """
    )

    return {
        "success": True,
        "chats": result.get("results", []),
    }


@app.get("/chats/{chat_id}/messages")
async def get_chat_messages(
    chat_id: int,
    username: str = Depends(require_login),
):
    result = await d1_query(
        """
        SELECT id, chat_id, role, content, created_at
        FROM messages
        WHERE chat_id = ?
        ORDER BY id ASC
        """,
        [chat_id],
    )

    return {
        "success": True,
        "messages": result.get("results", []),
    }
@app.delete("/chats/{chat_id}/messages/{message_id}")
async def delete_message(
    chat_id: int,
    message_id: int,
    username: str = Depends(require_login),
):
    result = await d1_query(
        """
        DELETE FROM messages
        WHERE id = ?
          AND chat_id = ?
        RETURNING id
        """,
        [message_id, chat_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    await d1_query(
        """
        UPDATE chats
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        [chat_id],
    )

    return {
        "success": True,
        "message": "Message deleted",
    }



@app.post("/chats/{chat_id}/messages")
async def save_message(
    chat_id: int,
    role: str = Form(...),
    content: str = Form(...),
    username: str = Depends(require_login),
):
    if role not in ["user", "assistant"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid message role",
        )

    if not content.strip():
        raise HTTPException(
            status_code=400,
            detail="Message content is empty",
        )

    result = await d1_query(
        """
        INSERT INTO messages (chat_id, role, content)
        VALUES (?, ?, ?)
        RETURNING id, chat_id, role, content, created_at
        """,
        [chat_id, role, content],
    )

    await d1_query(
        """
        UPDATE chats
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        [chat_id],
    )

    return {
        "success": True,
        "message": result.get("results", [])[0],
    }


@app.patch("/chats/{chat_id}/rename")
async def rename_chat(
    chat_id: int,
    title: str = Form(...),
    username: str = Depends(require_login),
):
    title = title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Chat title is empty",
        )

    result = await d1_query(
        """
        UPDATE chats
        SET title = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING id, title, pinned, created_at, updated_at
        """,
        [title, chat_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "success": True,
        "chat": rows[0],
    }


@app.patch("/chats/{chat_id}/pin")
async def toggle_pin(
    chat_id: int,
    pinned: int = Form(...),
    username: str = Depends(require_login),
):
    pinned = 1 if pinned else 0

    result = await d1_query(
        """
        UPDATE chats
        SET pinned = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING id, title, pinned, created_at, updated_at
        """,
        [pinned, chat_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "success": True,
        "chat": rows[0],
    }


@app.delete("/chats/{chat_id}")
async def delete_chat(
    chat_id: int,
    username: str = Depends(require_login),
):
    await d1_query(
        """
        DELETE FROM messages
        WHERE chat_id = ?
        """,
        [chat_id],
    )

    result = await d1_query(
        """
        DELETE FROM chats
        WHERE id = ?
        RETURNING id
        """,
        [chat_id],
    )

    rows = result.get("results", [])

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "success": True,
        "message": "Chat deleted",
    }


@app.get("/search-chats")
async def search_chats(
    q: str = "",
    username: str = Depends(require_login),
):
    q = q.strip()

    if not q:
        return {
            "success": True,
            "chats": [],
        }

    search_term = f"%{q}%"

    result = await d1_query(
        """
        SELECT DISTINCT
            c.id,
            c.title,
            c.pinned,
            c.folder_id,
            c.created_at,
            c.updated_at
        FROM chats c
        LEFT JOIN messages m
            ON m.chat_id = c.id
        WHERE c.title LIKE ?
           OR m.content LIKE ?
        ORDER BY c.pinned DESC, c.updated_at DESC
        """,
        [search_term, search_term],
    )

    return {
        "success": True,
        "chats": result.get("results", []),
    }

# =========================
# AI SETTINGS
# =========================

OPENROUTER_URL = (
    "https://openrouter.ai/api/v1/chat/completions"
)


SYSTEM_PROMPT = """
You are my personal AI assistant.

Understand Bangla, Banglish, and English.

Reply naturally and directly in the same language as the user.

Keep answers relevant and conversational.

Be honest when you do not know something.

You can analyze images when an image is provided.

Remember previous messages and use them as context.

Always be helpful, clear, and direct.
"""


# =========================
# AI REQUEST
# =========================

async def ask_ai(messages):

    if not API_KEY:
        return "API key পাওয়া যায়নি। .env ফাইল চেক করো।"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Personal AI",
    }

    data = {
        "model": "openrouter/free",
        "messages": messages,
    }

    try:

        async with httpx.AsyncClient(
            timeout=120
        ) as client:

            response = await client.post(
                OPENROUTER_URL,
                headers=headers,
                json=data,
            )

        if response.status_code != 200:
            return (
                f"AI API Error "
                f"({response.status_code}): "
                f"{response.text}"
            )

        result = response.json()

        choices = result.get("choices", [])

        if not choices:
            return "AI কোনো response দেয়নি।"

        content = (
            choices[0]
            .get("message", {})
            .get("content")
        )

        if not content:
            return "AI response পাওয়া যায়নি।"

        return content

    except Exception as error:
        return f"Connection error: {error}"


# =========================
# PREPARE HISTORY
# =========================

def prepare_history(history_text):

    try:
        history = json.loads(history_text)

        if not isinstance(history, list):
            return []

        cleaned_history = []

        history = history[-30:]

        for item in history:

            if not isinstance(item, dict):
                continue

            role = item.get("role")
            content = item.get("content")

            if role not in ["user", "assistant"]:
                continue

            if not content:
                continue

            cleaned_history.append({
                "role": role,
                "content": str(content),
            })

        return cleaned_history

    except Exception:
        return []


# =========================
# TEXT CHAT
# =========================

@app.post("/chat")
async def chat(
    message: str = Form(...),
    history: str = Form("[]"),
    username: str = Depends(require_login),
):
    previous_messages = prepare_history(
        history
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    messages.extend(previous_messages)

    messages.append({
        "role": "user",
        "content": message,
    })

    answer = await ask_ai(messages)

    return {
        "reply": answer,
    }


# =========================
# IMAGE CHAT
# =========================

@app.post("/chat-image")
async def chat_image(
    message: str = Form(""),
    history: str = Form("[]"),
    image: UploadFile = File(...),
    username: str = Depends(require_login),
):
    image_bytes = await image.read()

    if not image_bytes:
        return {
            "reply": "Image পাওয়া যায়নি।",
        }

    mime_type = image.content_type

    if not mime_type:
        mime_type = mimetypes.guess_type(
            image.filename or ""
        )[0]

    if not mime_type:
        mime_type = "image/jpeg"

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    image_url = (
        f"data:{mime_type};base64,"
        f"{image_base64}"
    )

    if message.strip():
        text = message
    else:
        text = (
            "Analyze this image and tell me "
            "what you see."
        )

    user_content = [
        {
            "type": "text",
            "text": text,
        },
        {
            "type": "image_url",
            "image_url": {
                "url": image_url,
            },
        },
    ]

    previous_messages = prepare_history(
        history
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    messages.extend(previous_messages)

    messages.append({
        "role": "user",
        "content": user_content,
    })

    answer = await ask_ai(messages)

    return {
        "reply": answer,
    }