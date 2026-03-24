"""
Create Nike Board Search Test Project
Uses publicly available information about Nike's board of directors
"""

from models.base import get_db
from models.user import User
from sqlalchemy import text
from datetime import datetime, date

db = next(get_db())

# Create Nike project
print("Creating Nike Board Search project...")

nike_project = db.execute(text("""
    INSERT INTO projects (
        client_name,
        board_name,
        company_ticker,
        industry,
        status,
        target_completion_date,
        description,
        lead_consultant_id
    ) VALUES (
        'Nike, Inc.',
        'Nike Board of Directors',
        'NKE',
        'Athletic Apparel & Footwear',
        'active',
        :target_date,
        'Board diversity and technology expertise search for Nike, Inc.',
        (SELECT id FROM users WHERE email = 'admin@boardready.com' LIMIT 1)
    ) RETURNING id
"""), {"target_date": date(2026, 6, 30)})

project_id = nike_project.fetchone()[0]
print(f"✓ Created project ID: {project_id}")

# Nike board members (public information from Nike investor relations)
board_members = [
    {
        "name": "John Donahoe",
        "organization": "Nike, Inc.",
        "position": "President & CEO",
        "linkedin_url": "https://www.linkedin.com/in/johndonahoe/",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "Over 65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Corporate",
                "expertise": ["Technology", "E-commerce", "Strategic Planning", "Operations"],
                "years_on_board": 5
            },
            "geography": {
                "primary_location": "Portland, Oregon",
                "regions": ["Pacific Northwest"]
            }
        }
    },
    {
        "name": "Mark Parker",
        "organization": "Nike, Inc.",
        "position": "Executive Chairman",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "Over 65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Corporate",
                "expertise": ["Product Development", "Design", "Brand Management", "Strategic Planning"],
                "years_on_board": 25
            },
            "geography": {
                "primary_location": "Portland, Oregon",
                "regions": ["Pacific Northwest"]
            }
        }
    },
    {
        "name": "Timothy Cook",
        "organization": "Apple Inc.",
        "position": "CEO",
        "linkedin_url": "https://www.linkedin.com/in/tim-cook-6382a511/",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "51-65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Technology",
                "expertise": ["Technology", "Operations", "Supply Chain", "Finance"],
                "years_on_board": 15
            },
            "geography": {
                "primary_location": "Cupertino, California",
                "regions": ["Silicon Valley", "Bay Area"]
            }
        }
    },
    {
        "name": "Michelle Peluso",
        "organization": "CVS Health",
        "position": "Chief Customer & Experience Officer",
        "matrix_data": {
            "demographics": {
                "gender": "Female",
                "age_range": "51-65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Corporate",
                "expertise": ["Marketing", "Digital Transformation", "E-commerce", "Customer Experience"],
                "years_on_board": 7
            },
            "geography": {
                "primary_location": "New York, New York",
                "regions": ["Northeast"]
            }
        }
    },
    {
        "name": "Cathleen Benko",
        "organization": "Deloitte (Retired)",
        "position": "Former Vice Chairman",
        "matrix_data": {
            "demographics": {
                "gender": "Female",
                "age_range": "51-65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Professional Services",
                "expertise": ["HR/Diversity", "Operations", "Consulting", "Corporate Strategy"],
                "years_on_board": 10
            },
            "geography": {
                "primary_location": "San Francisco, California",
                "regions": ["Bay Area"]
            }
        }
    },
    {
        "name": "Peter Henry",
        "organization": "NYU Stern School of Business",
        "position": "Dean",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "51-65",
                "race_ethnicity": "African American/Black"
            },
            "professional": {
                "sector": "Education",
                "expertise": ["Finance", "Economics", "Education", "International Business"],
                "years_on_board": 6
            },
            "geography": {
                "primary_location": "New York, New York",
                "regions": ["Northeast"]
            }
        }
    },
    {
        "name": "Travis Knight",
        "organization": "Laika Entertainment",
        "position": "CEO & President",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "51-65",
                "race_ethnicity": "Caucasian"
            },
            "professional": {
                "sector": "Media & Entertainment",
                "expertise": ["Arts & Culture", "Media", "Creative Leadership", "Innovation"],
                "years_on_board": 12
            },
            "geography": {
                "primary_location": "Portland, Oregon",
                "regions": ["Pacific Northwest"]
            }
        }
    },
    {
        "name": "John Rogers Jr.",
        "organization": "Ariel Investments",
        "position": "Chairman & CEO",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "Over 65",
                "race_ethnicity": "African American/Black"
            },
            "professional": {
                "sector": "Finance",
                "expertise": ["Finance/Investments", "Asset Management", "Governance"],
                "years_on_board": 18
            },
            "geography": {
                "primary_location": "Chicago, Illinois",
                "regions": ["Midwest"]
            }
        }
    },
    {
        "name": "Johnathan Rodgers",
        "organization": "TV One (Retired)",
        "position": "Former CEO",
        "matrix_data": {
            "demographics": {
                "gender": "Male",
                "age_range": "Over 65",
                "race_ethnicity": "African American/Black"
            },
            "professional": {
                "sector": "Media",
                "expertise": ["Media", "Broadcasting", "Communications", "Marketing"],
                "years_on_board": 22
            },
            "geography": {
                "primary_location": "Washington, D.C.",
                "regions": ["Mid-Atlantic"]
            }
        }
    }
]

# Insert board members
for member in board_members:
    db.execute(text("""
        INSERT INTO board_members (
            project_id,
            name,
            organization,
            position,
            linkedin_url,
            matrix_data,
            data_source
        ) VALUES (
            :project_id,
            :name,
            :organization,
            :position,
            :linkedin_url,
            :matrix_data::jsonb,
            'manual'
        )
    """), {
        "project_id": project_id,
        "name": member["name"],
        "organization": member["organization"],
        "position": member["position"],
        "linkedin_url": member.get("linkedin_url"),
        "matrix_data": str(member["matrix_data"]).replace("'", '"')
    })
    print(f"✓ Added board member: {member['name']}")

# Generate some gaps based on analysis
gaps = [
    {
        "category": "diversity_gender",
        "title": "Limited Female Representation",
        "description": "Only 2 out of 9 directors are female (22%), below industry standard of 30-40%",
        "priority": "high",
        "priority_score": 85,
        "target_profile": {
            "demographics_preferred": {"gender": "Female"},
            "expertise_required": ["Technology", "Retail", "International Business"],
            "geography_preferred": ["West Coast", "International"]
        }
    },
    {
        "category": "expertise",
        "title": "Sustainability & ESG Expertise Gap",
        "description": "No dedicated sustainability or environmental expertise on board, critical for Nike's environmental goals",
        "priority": "critical",
        "priority_score": 95,
        "target_profile": {
            "expertise_required": ["Sustainability", "ESG", "Environmental Policy"],
            "demographics_preferred": {},
            "geography_preferred": ["Any"]
        }
    },
    {
        "category": "diversity_age",
        "title": "Age Diversity - Limited Young Perspectives",
        "description": "No directors under 50, missing perspective on Gen Z consumers and emerging trends",
        "priority": "medium",
        "priority_score": 70,
        "target_profile": {
            "demographics_preferred": {"age_range": "35-50"},
            "expertise_required": ["Digital Marketing", "Social Media", "E-commerce"],
            "geography_preferred": ["West Coast", "International"]
        }
    },
    {
        "category": "geography",
        "title": "Limited International Presence",
        "description": "Board is US-centric, need perspectives from key growth markets (Asia, Europe, Latin America)",
        "priority": "high",
        "priority_score": 80,
        "target_profile": {
            "expertise_required": ["International Business", "Emerging Markets"],
            "demographics_preferred": {},
            "geography_preferred": ["Asia", "Europe", "Latin America"]
        }
    },
    {
        "category": "expertise",
        "title": "AI & Data Analytics Expertise",
        "description": "Limited deep AI/ML expertise needed for digital transformation and personalization",
        "priority": "high",
        "priority_score": 85,
        "target_profile": {
            "expertise_required": ["AI/ML", "Data Analytics", "Digital Transformation"],
            "demographics_preferred": {},
            "geography_preferred": ["Silicon Valley", "Seattle", "International Tech Hubs"]
        }
    }
]

for gap in gaps:
    db.execute(text("""
        INSERT INTO gap_analysis (
            project_id,
            gap_category,
            gap_title,
            gap_description,
            priority,
            priority_score,
            target_profile,
            status,
            ai_generated
        ) VALUES (
            :project_id,
            :category,
            :title,
            :description,
            :priority,
            :priority_score,
            :target_profile::jsonb,
            'open',
            false
        )
    """), {
        "project_id": project_id,
        "category": gap["category"],
        "title": gap["title"],
        "description": gap["description"],
        "priority": gap["priority"],
        "priority_score": gap["priority_score"],
        "target_profile": str(gap["target_profile"]).replace("'", '"')
    })
    print(f"✓ Added gap: {gap['title']}")

# Log activity
db.execute(text("""
    INSERT INTO project_activity (
        project_id,
        user_id,
        activity_type,
        activity_description
    ) VALUES (
        :project_id,
        (SELECT id FROM users WHERE email = 'admin@boardready.com' LIMIT 1),
        'project_created',
        'Created Nike Board Search project with initial board analysis'
    )
"""), {"project_id": project_id})

db.commit()

print("\n✅ Nike test project created successfully!")
print(f"Project ID: {project_id}")
print(f"Board Members: {len(board_members)}")
print(f"Gaps Identified: {len(gaps)}")
print("\nYou can now view this project in the UI!")

