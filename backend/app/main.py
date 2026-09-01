from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, companies, applications, contacts, outreach, interview_rounds, ai

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Interview Prep & Application Tracker with Google Gemini 3.7 Flash & Ollama AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(applications.router)
app.include_router(contacts.router)
app.include_router(outreach.router)
app.include_router(interview_rounds.router)
app.include_router(ai.router)


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning 200 OK for uptime monitoring.
    """
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
