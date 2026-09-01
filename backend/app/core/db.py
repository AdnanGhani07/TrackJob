from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Configure engine options dynamically based on database URL
connect_args = {}
# Neon.tech requires SSL connection; automatically ensure sslmode=require if connecting to neon.tech or if sslmode is in URL
if "neon.tech" in settings.DATABASE_URL or "sslmode=require" in settings.DATABASE_URL:
    connect_args["sslmode"] = "require"

# Pool pre-ping tests connections before giving them out to ensure they are alive
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
