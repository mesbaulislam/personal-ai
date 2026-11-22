# MS GPT

A personal AI chat web app — a single-user FastAPI backend with a
static HTML/JS/CSS frontend. Chat with an AI model through OpenRouter,
with conversation history stored in Cloudflare D1.

- **Product name:** MS GPT (the repository is named `personal-ai`)
- **Author:** Mesbaul Islam
- **Backend:** Python + FastAPI (`main.py`)
- **Frontend:** HTML, JavaScript, CSS (`static/`)
- **AI provider:** OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- **Model:** `nvidia/nemotron-3-super-120b-a12b:free`
- **Chat storage:** Cloudflare D1 (SQLite-compatible, via the Cloudflare API)
- **Deployment:** Render (live since 5 October 2026)

> This is the real project source. An older template-style version of
> this repository previously existed on GitHub; this README documents
> the actual code in this repo.

## Features

### Chat

- Text chat with history — the backend sends the last 30 messages
  (`prepare_history()` in `main.py`) as context. The UI shows
  `Context: X / 30 messages`; the `30` in that indicator is
  display-only, the backend decides what is actually sent.
- Image chat (`/chat-image`) — upload an image with a message and the
  model analyses it.
- Web search toggle — when on, the backend fetches up to 5 DuckDuckGo
  results and gives them to the model as context for current or
  time-sensitive questions.
- File upload (`/upload-file`) — text is extracted from TXT, PDF and
  DOCX files so it can be used in the chat.

### Conversations (stored in Cloudflare D1)

- Create, rename, delete and pin chats; move chats into folders.
- Create, rename and delete folders.
- Search chats by title or message content.
- Delete individual messages.
- Export a conversation as TXT.
- Private mode toggle (frontend setting).

### Auth & UI

- Single-user login — username `Mesbaul_AI`, password from the
  `PERSONAL_AI_PASSWORD` environment variable. Session cookie
  (`personal_ai_session`, HTTP-only, signed with `SESSION_SECRET`).
- Dark / Light theme, sidebar expand/collapse and resize (width saved
  in the browser), New Chat, Settings panel.
- Settings (saved in the browser): theme, Enter to Send, Context
  Indicator on/off, message timestamps, web search, private mode,
  logout.
- Responsive layout; MS GPT branding on the login screen and header.

## Project structure

```
personal-ai/
  main.py              # FastAPI backend — the whole server
  requirements.txt     # Python dependencies (unpinned)
  static/
    index.html         # The page served at "/"
    app.js             # Frontend application
    style.css          # Frontend stylesheet
  README.md            # This file
  .gitignore
  .env.example         # Variable names only — fill in your own values
```

`main.py` serves `static/index.html` at `/` and mounts the rest of
`static/` at `/static`. **Do not move `index.html` to the repository
root** — the backend expects it at `static/index.html` and raises an
error if it is not there.

## Requirements

- Python 3.10+ (any recent Python 3)
- A Cloudflare account with a D1 database
- An OpenRouter API key

## Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/mesbaulislam/personal-ai.git
cd personal-ai
```

### 2. Create a virtual environment and install dependencies

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Dependencies (`requirements.txt`, versions unpinned):

| Package | Used for |
|---|---|
| fastapi | Web framework |
| uvicorn | ASGI server |
| python-dotenv | Loads `.env` |
| httpx | Calls to OpenRouter and Cloudflare D1 |
| python-multipart | Form data / file uploads |
| itsdangerous | Signs the session cookie |
| pypdf | Text extraction from PDF uploads |
| python-docx | Text extraction from DOCX uploads |

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` and fill in your own values. See `.env.example` —
it lists variable names only, no real values.

| Variable | Required | What it is |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI replies |
| `PERSONAL_AI_PASSWORD` | Yes | Login password for user `Mesbaul_AI` |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies — the app refuses to start without it |
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API token with D1 access |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Your Cloudflare account ID |
| `D1_DATABASE_ID` | Yes | Your Cloudflare D1 database ID |

The D1 database must already contain the `chats`, `folders` and
`messages` tables the code queries — **no table-creation SQL is
included in this repository**, so create the database and its tables in
Cloudflare first.

### 4. Run

There is **no `python main.py` entry point** — run it with Uvicorn:

```bash
uvicorn main:app --reload
```

Then open http://127.0.0.1:8000 and log in as `Mesbaul_AI` with the
password from your `.env`.

## Deployment (Render)

- The app reads the `RENDER` environment variable: when
  `RENDER=true`, the login cookie is set with `secure=True`; locally
  (no `RENDER` variable) it is `secure=False`.
- Set all six variables from `.env.example` in the Render dashboard —
  never commit a real `.env` file.
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## API endpoints

All endpoints except `/`, `/login`, `/check-session`, `/logout` and
`/health` require a logged-in session.

| Method & path | What it does |
|---|---|
| `GET /` | Serves `static/index.html` |
| `POST /login` | Username + password login, sets session cookie |
| `GET /check-session` | Reports whether the session is logged in |
| `POST /logout` | Clears the session cookie |
| `GET /health` | Health check |
| `POST /upload-file` | Extracts text from an uploaded TXT / PDF / DOCX |
| `GET /test-d1` | Tests the Cloudflare D1 connection |
| `GET /chats`, `POST /chats` | List / create chats |
| `GET /chats/{id}/messages`, `POST /chats/{id}/messages` | Read / save messages |
| `PATCH /chats/{id}/rename`, `PATCH /chats/{id}/pin` | Rename / pin a chat |
| `PATCH /chats/{id}/folder` | Move a chat into a folder |
| `DELETE /chats/{id}`, `DELETE /chats/{id}/messages/{message_id}` | Delete a chat / a message |
| `GET /search-chats` | Search chats by title or content |
| `GET /folders`, `POST /folders` | List / create folders |
| `PATCH /folders/{id}/rename`, `DELETE /folders/{id}` | Rename / delete a folder |
| `POST /chat` | Text chat (optional web search) |
| `POST /chat-image` | Image + text chat |

## How the code is organised (`main.py`, 1,315 lines)

| Section | What it does |
|---|---|
| Environment | Loads `.env`, reads the 6 variables, builds the signed-cookie serializer |
| Cloudflare D1 | `d1_query()` — parameterised queries against the D1 HTTP API |
| File text extraction | `extract_file_text()` — TXT / PDF / DOCX to plain text |
| Frontend | Serves `static/index.html` at `/`, mounts `/static` |
| Login | `/login`, `/check-session`, `/logout`, `require_login()` guard |
| Chats & folders | CRUD for chats, folders and messages in D1 |
| AI settings | OpenRouter URL, model, system prompt |
| AI request | `ask_ai()` — POST to OpenRouter `/v1/chat/completions` |
| Web search | `web_search()` — scrapes DuckDuckGo HTML results (max 5) |
| Prepare history | `prepare_history()` — last 30 messages, user/assistant roles only |
| Text chat | `/chat` — history + optional search results + message → model |
| Image chat | `/chat-image` — image as base64 data URL + message → model |

## Security notes

- `.env` is in `.gitignore` and must never be committed. Rotate any
  key that was ever shared or committed by mistake.
- Single user only — there is no signup, no multi-user support and no
  brute-force protection.
- The session secret must be long and random; anyone with it can forge
  a login cookie.
- Uploaded file contents are read into memory; large files can use a
  lot of RAM.

## Known limitations

- D1 tables are not created by the code — the database must be set up
  beforehand (see Setup step 3).
- Min/max history is fixed at 30 messages in `prepare_history()`;
  the UI indicator only displays that number.
- File uploads are text-only (TXT / PDF / DOCX); the app does not
  store the uploaded files themselves.
- Settings Step 5 (Files & Images previews in the Settings panel) was
  paused and is not part of this code — do not treat it as implemented.

## Future updates

MS GPT is under active development — more updates are coming in the
future, with new features and improvements planned.

## Verification

Checked during this upload (no code changed):

- `python -m py_compile main.py` — PASS
- `node --check` on `static/app.js` — PASS
- No API keys, tokens, passwords or private values in any uploaded
  file — all credentials live only in `.env`, which is not uploaded.
  `.env.example` contains placeholder text only.
- The app was not run live as part of this upload; run it locally
  (see Setup) before treating it as working.

## Licence

No licence file is included in this upload. The repository already
contains a `LICENSE` file from its earlier history — that file was
left untouched.
