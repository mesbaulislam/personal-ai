import os
import base64
import mimetypes
import json

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, Cookie, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from itsdangerous import URLSafeSerializer

# =========================
# ENVIRONMENT
# =========================

load_dotenv(dotenv_path=".env", override=True)

print("ENV LOADED:", os.path.exists(".env"))
print("PASSWORD VALUE EXISTS:", bool(os.getenv("PERSONAL_AI_PASSWORD")))

API_KEY = os.getenv("OPENROUTER_API_KEY")
USERNAME = "Mesbaul_AI"
PASSWORD = os.getenv("PERSONAL_AI_PASSWORD")
print("PASSWORD LOADED:", bool(PASSWORD), "LENGTH:", len(PASSWORD or ""))
SESSION_SECRET = os.getenv("SESSION_SECRET")

serializer = URLSafeSerializer(SESSION_SECRET)
# =========================
# APP
# =========================

app = FastAPI(title="Personal AI")


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# FRONTEND
# =========================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


@app.get("/")
async def home():
   return FileResponse("static/index.html")


# =========================
# HEALTH
# =========================
# =========================
# LOGIN
# =========================

@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):

    if username != USERNAME or password != PASSWORD:

        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "message": "Username অথবা password ভুল।"
            }
        )

    session_token = serializer.dumps({
        "username": USERNAME
    })

    response = JSONResponse({
        "success": True,
        "message": "Login successful"
    })

    response.set_cookie(
        key="personal_ai_session",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return response
    # =========================
# CHECK SESSION
# =========================

@app.get("/check-session")
async def check_session(
    personal_ai_session: str = Cookie(default=None)
):

    if not personal_ai_session:
        return {
            "logged_in": False
        }

    try:

        data = serializer.loads(
            personal_ai_session
        )

        if data.get("username") == USERNAME:

            return {
                "logged_in": True,
                "username": USERNAME
            }

    except Exception:
        pass

    return {
        "logged_in": False
    }
@app.post("/logout")
async def logout():
    response = JSONResponse({
        "success": True,
        "message": "Logged out"
    })

    response.delete_cookie(
        key="personal_ai_session"
    )

    return response
@app.get("/health")
async def health():
    return {
        "status": "ok"
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

Reply naturally and directly.
Use the same language as the user whenever practical.

Do not unnecessarily repeat disclaimers,
warnings, or moral lectures.

Keep answers relevant and conversational.

Be honest when you do not know something.

You can analyze images when an image is provided.

Remember the previous messages in the current conversation
and use them as context when answering.
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
                json=data
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

        content = choices[0].get("message", {}).get("content")

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

        # Safety limit
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
                "content": str(content)
            })

        return cleaned_history

    except Exception:
        return []


# =========================
# TEXT CHAT
# =========================
def require_login(
    personal_ai_session: str = Cookie(default=None)
):
    if not personal_ai_session:
        raise HTTPException(
            status_code=401,
            detail="Login required"
        )

    try:
        data = serializer.loads(personal_ai_session)

        if data.get("username") != USERNAME:
            raise HTTPException(
                status_code=401,
                detail="Invalid session"
            )

        return data["username"]

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )
@app.post("/chat")
async def chat(
    message: str = Form(...),
    history: str = Form("[]"),
    username: str = Depends(require_login)
):

    previous_messages = prepare_history(history)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    messages.extend(previous_messages)

    messages.append({
        "role": "user",
        "content": message
    })

    answer = await ask_ai(messages)

    return {
        "reply": answer
    }


# =========================
# IMAGE CHAT
# =========================

@app.post("/chat-image")
async def chat_image(
    message: str = Form(""),
    history: str = Form("[]"),
    image: UploadFile = File(...),
    username: str = Depends(require_login)
):
    image_bytes = await image.read()

    if not image_bytes:

        return {
            "reply": "Image পাওয়া যায়নি।"
        }


    mime_type = image.content_type

    if not mime_type:

        mime_type = mimetypes.guess_type(
            image.filename or ""
        )[0]


    if not mime_type:

        mime_type = "image/jpeg"


    # =========================
    # IMAGE → BASE64
    # =========================

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")


    image_url = (
        f"data:{mime_type};base64,"
        f"{image_base64}"
    )


    # =========================
    # MESSAGE
    # =========================

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
            "text": text
        },

        {
            "type": "image_url",
            "image_url": {
                "url": image_url
            }
        }

    ]


    # =========================
    # HISTORY
    # =========================

    previous_messages = prepare_history(history)


    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    messages.extend(previous_messages)

    messages.append({
        "role": "user",
        "content": user_content
    })


    # =========================
    # AI
    # =========================

    answer = await ask_ai(messages)


    return {
        "reply": answer
    }