import os
import uuid
from datetime import datetime

import httpx
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://vllm:8000")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen")
API_KEY = os.getenv("API_KEY", "changeme")

app = FastAPI(title="Qwen Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory conversation store (swap for Redis/DB in production)
conversations: dict[str, list[dict]] = {}


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    stream: bool = True


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str


def verify_key(authorization: str | None):
    if API_KEY == "changeme":
        return
    if not authorization or authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/api/health")
async def health():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{VLLM_BASE_URL}/health", timeout=5)
            vllm_ok = resp.status_code == 200
        except Exception:
            vllm_ok = False
    return {"status": "ok", "vllm": vllm_ok}


@app.get("/api/models")
async def list_models(authorization: str | None = Header(None)):
    verify_key(authorization)
    return {"models": [{"id": MODEL_NAME, "name": "Qwen 2.5 7B Instruct"}]}


@app.get("/api/conversations")
async def list_conversations(authorization: str | None = Header(None)):
    verify_key(authorization)
    result = []
    for cid, messages in conversations.items():
        title = messages[0]["content"][:50] if messages else "New chat"
        result.append({"id": cid, "title": title, "message_count": len(messages)})
    return {"conversations": result}


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str, authorization: str | None = Header(None)
):
    verify_key(authorization)
    conversations.pop(conversation_id, None)
    return {"status": "deleted"}


@app.post("/api/chat")
async def chat(req: ChatRequest, authorization: str | None = Header(None)):
    verify_key(authorization)

    conv_id = req.conversation_id or str(uuid.uuid4())
    if conv_id not in conversations:
        conversations[conv_id] = []

    history = conversations[conv_id]
    history.append({"role": "user", "content": req.message})

    # Build messages with system prompt
    messages = [
        {
            "role": "system",
            "content": "You are Qwen, a helpful AI assistant. Be concise, accurate, and helpful.",
        }
    ] + history

    if req.stream:
        return StreamingResponse(
            stream_response(conv_id, messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Conversation-Id": conv_id,
            },
        )

    # Non-streaming
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{VLLM_BASE_URL}/v1/chat/completions",
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.7,
            },
            timeout=120,
        )
        data = resp.json()

    assistant_msg = data["choices"][0]["message"]["content"]
    history.append({"role": "assistant", "content": assistant_msg})

    return {
        "conversation_id": conv_id,
        "message": assistant_msg,
    }


async def stream_response(conv_id: str, messages: list[dict]):
    full_response = ""
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{VLLM_BASE_URL}/v1/chat/completions",
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.7,
                "stream": True,
            },
            timeout=120,
        ) as resp:
            # Send conversation ID first
            yield f"data: {{\"conversation_id\": \"{conv_id}\"}}\n\n"

            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    chunk = line[6:]
                    if chunk.strip() == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        import json

                        parsed = json.loads(chunk)
                        delta = parsed["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            full_response += content
                            yield f"data: {{\"content\": {json.dumps(content)}}}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    # Save assistant response to history
    if conv_id in conversations:
        conversations[conv_id].append(
            {"role": "assistant", "content": full_response}
        )
