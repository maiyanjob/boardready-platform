from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("DATABASE_URL"):
    backend_env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=backend_env_path)

SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Checked the current shell environment and "
        f"{Path(__file__).resolve().parent.parent / '.env'}."
    )

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class IdMixin:
    id: Mapped[int] = mapped_column(primary_key=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
