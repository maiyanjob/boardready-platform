from models import Base, engine
from models.user import User
from models.candidate import Candidate
from models.board import Board
from models.document import Document

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created successfully!")
print("\nTables created:")
print("- users")
print("- candidates (with bio_embedding for semantic search)")
print("- boards (with description_embedding)")
print("- documents (with content_embedding)")
