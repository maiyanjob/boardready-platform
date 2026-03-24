from models.base import get_db
from models.candidate import Candidate
from sqlalchemy import func

db = next(get_db())

# Find duplicates by name
duplicates = db.query(
    Candidate.name,
    func.count(Candidate.id).label('count')
).group_by(Candidate.name).having(func.count(Candidate.id) > 1).all()

print(f"Found {len(duplicates)} duplicate names")

for name, count in duplicates:
    # Keep first, delete rest
    candidates = db.query(Candidate).filter_by(name=name).all()
    for candidate in candidates[1:]:  # Skip first one
        print(f"  Deleting duplicate: {candidate.name} (ID: {candidate.id})")
        db.delete(candidate)

db.commit()
print(f"✅ Cleaned up duplicates! Check your candidates page.")
