# backend/api/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth_routes, rag_routes
from api.routes import chat_routes


app = FastAPI(
    title="Medical MiniLLM (RAG)",
    description="Medical Question Answering using RAG + Groq API",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router)
app.include_router(rag_routes.router)
app.include_router(chat_routes.router)




@app.get("/")
def health_check():
    return {"status": "Medical MiniLLM API is running"}
