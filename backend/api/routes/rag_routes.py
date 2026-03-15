from fastapi import APIRouter, Depends
from api.models.request_model import QueryRequest
from api.auth import get_current_user
from rag.retriever import retrieve
from llm.generator import generate_answer_with_history
from api.database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/ask")
async def ask_question(
    request: QueryRequest,
    current_user: str = Depends(get_current_user)
):

    messages_collection = db["messages"]
    conversations_collection = db["conversations"]

    conversation = await conversations_collection.find_one({
    "_id": ObjectId(request.conversation_id),
    "user_id": current_user
})


    if not conversation:
        return {"error": "Conversation not found"}

    history = []

    async for msg in messages_collection.find(
        {"conversation_id": request.conversation_id}
    ).sort("_id", 1):
        history.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    retrieved_chunks = retrieve(request.question, k=5)

    if retrieved_chunks:
        context_text = "\n\n".join(
            [chunk["text"] for chunk in retrieved_chunks]
)



        system_message = {
            "role": "system",
            "content": (
                "You are a careful medical assistant. "
                "Use the following context to answer.\n\n"
                f"{context_text}\n\n"
                "If unsure, say you don't know."
            )
        }

        full_messages = [system_message] + history + [
            {"role": "user", "content": request.question}
        ]

        answer = generate_answer_with_history(full_messages)

        sources = [
    {
        "source": chunk["source"],
        "chunk_id": chunk["chunk_id"]
    }
    for chunk in retrieved_chunks
]



    else:
        full_messages = history + [
            {"role": "user", "content": request.question}
        ]

        answer = generate_answer_with_history(full_messages)
        sources = []

    await messages_collection.insert_one({
        "conversation_id": request.conversation_id,
        "role": "user",
        "content": request.question,
        "created_at": datetime.utcnow()
    })

    if conversation["title"] == "New Chat":
        new_title = request.question[:40]
        await conversations_collection.update_one(
            {"_id": ObjectId(request.conversation_id)},
            {"$set": {"title": new_title}}
        )

    await messages_collection.insert_one({
        "conversation_id": request.conversation_id,
        "role": "assistant",
        "content": answer,
        "created_at": datetime.utcnow()
    })

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }
