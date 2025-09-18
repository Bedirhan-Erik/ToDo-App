from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base


SQLALCHEMY_DATABASE_URL = "sqlite:///./todo.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base= declarative_base()

def get_session():
    db= SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def init_db():
    from . import models
    Base.metadata.create_all(bind=engine)
    _run_simple_migrations()

def _run_simple_migrations():
    with engine.begin() as conn:
        cols = {row[1] for row in conn.execute(text("PRAGMA table_info(todo_lists)"))}
        if "created_at" not in cols:
            conn.execute(text("ALTER TABLE todo_lists ADD COLUMN created_at TEXT"))
        cols_items = {row[1] for row in conn.execute(text("PRAGMA table_info(todo_items)"))}
        if "created_at" not in cols_items:
            conn.execute(text("ALTER TABLE todo_items ADD COLUMN created_at TEXT"))