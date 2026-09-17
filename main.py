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
    username: str = Depends(require_login),
):
    title = title.strip() or "New Chat"

    result = await d1_query(
        """
        INSERT INTO chats (title)
        VALUES (?)
        RETURNING id, title, pinned, created_at, updated_at
        """,
        [title],
    )

    return {
        "success": True,
        "chat": result.get("results", [])[0],
    }


@app.get("/chats")
async def get_chats(
    username: str = Depends(require_login),
):
    result = await d1_query(
        """
        SELECT id, title, pinned, created_at, updated_at
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