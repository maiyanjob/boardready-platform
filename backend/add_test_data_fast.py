import os
import sys
from dotenv import load_dotenv
from models.base import get_db
from models.candidate import Candidate
from models.board import Board
from services.claude_service import ClaudeService

load_dotenv()

claude_service = ClaudeService()

# 15 More Candidates
CANDIDATES = [
    {
        "name": "Jennifer Martinez",
        "title": "Chief Financial Officer",
        "company": "FinTech Innovations",
        "bio": "Seasoned CFO with 18 years in fintech and payments. Led three successful IPOs. Expert in regulatory compliance, risk management, and scaling financial operations. Former board member at two major payment processors.",
        "years_experience": 18,
        "board_count": 2,
        "industries": ["Finance", "FinTech", "Payments"],
        "skills": ["IPO Preparation", "Risk Management", "Regulatory Compliance", "Financial Modeling"]
    },
    {
        "name": "David Kim",
        "title": "Chief Technology Officer",
        "company": "DataStream Analytics",
        "bio": "Technology executive with 20 years building AI/ML platforms at scale. Previously led engineering at two unicorn startups. Deep expertise in data infrastructure, machine learning, and cloud architecture.",
        "years_experience": 20,
        "board_count": 1,
        "industries": ["Technology", "AI/ML", "Data Analytics"],
        "skills": ["Machine Learning", "Cloud Architecture", "Data Engineering", "Product Strategy"]
    },
    {
        "name": "Patricia O'Connor",
        "title": "Chief Operating Officer",
        "company": "GlobalRetail Corp",
        "bio": "Operations leader with 22 years in retail and e-commerce. Scaled operations across 30+ countries. Expert in supply chain optimization, logistics, and international expansion. Served on boards of three Fortune 1000 companies.",
        "years_experience": 22,
        "board_count": 3,
        "industries": ["Retail", "E-commerce", "Supply Chain"],
        "skills": ["Operations Management", "Supply Chain", "International Expansion", "Logistics"]
    },
    {
        "name": "Robert Chen",
        "title": "Chief Executive Officer",
        "company": "BioHealth Solutions",
        "bio": "Healthcare executive with 25 years in biotechnology and pharmaceuticals. Led drug development programs from research through FDA approval. Expert in clinical trials, regulatory affairs, and commercialization strategy.",
        "years_experience": 25,
        "board_count": 4,
        "industries": ["Healthcare", "Biotechnology", "Pharmaceuticals"],
        "skills": ["Drug Development", "FDA Regulatory", "Clinical Trials", "Commercialization"]
    },
    {
        "name": "Amanda Williams",
        "title": "Chief Marketing Officer",
        "company": "BrandForge Media",
        "bio": "Marketing executive with 15 years building global brands. Led digital transformation at Fortune 500 company. Expert in brand strategy, customer acquisition, and performance marketing. Board advisor for three consumer tech startups.",
        "years_experience": 15,
        "board_count": 3,
        "industries": ["Marketing", "Consumer Tech", "Digital Media"],
        "skills": ["Brand Strategy", "Digital Marketing", "Customer Acquisition", "Growth Marketing"]
    },
    {
        "name": "James Thompson",
        "title": "Chief Information Security Officer",
        "company": "SecureNet Technologies",
        "bio": "Cybersecurity leader with 17 years protecting enterprise infrastructure. Former CISO at two Fortune 500 companies. Expert in security architecture, compliance, and incident response. Certified CISSP and CISM.",
        "years_experience": 17,
        "board_count": 2,
        "industries": ["Cybersecurity", "Technology", "Enterprise Software"],
        "skills": ["Security Architecture", "Compliance", "Incident Response", "Risk Assessment"]
    },
    {
        "name": "Maria Garcia",
        "title": "Chief Human Resources Officer",
        "company": "TalentFirst Consulting",
        "bio": "HR executive with 19 years building high-performance cultures. Led people operations through multiple acquisitions. Expert in talent development, organizational design, and executive compensation. Board member at two professional services firms.",
        "years_experience": 19,
        "board_count": 2,
        "industries": ["Human Resources", "Professional Services", "Consulting"],
        "skills": ["Talent Development", "Organizational Design", "Executive Compensation", "M&A Integration"]
    },
    {
        "name": "Thomas Anderson",
        "title": "Chief Strategy Officer",
        "company": "Venture Growth Partners",
        "bio": "Strategy executive with 21 years in management consulting and corporate development. Former partner at top-tier consulting firm. Expert in M&A, strategic planning, and market entry. Advised boards of 50+ companies.",
        "years_experience": 21,
        "board_count": 1,
        "industries": ["Strategy", "Consulting", "Private Equity"],
        "skills": ["M&A Strategy", "Corporate Development", "Strategic Planning", "Market Analysis"]
    },
    {
        "name": "Lisa Zhang",
        "title": "Chief Product Officer",
        "company": "InnovateSoft Inc",
        "bio": "Product leader with 16 years building enterprise SaaS platforms. Led product development at three successful startups through exit. Expert in product strategy, user experience, and go-to-market planning.",
        "years_experience": 16,
        "board_count": 2,
        "industries": ["SaaS", "Enterprise Software", "Product Management"],
        "skills": ["Product Strategy", "User Experience", "Go-to-Market", "Agile Development"]
    },
    {
        "name": "Daniel Brown",
        "title": "Chief Legal Officer",
        "company": "LegalTech Advisors",
        "bio": "General counsel with 23 years in corporate law and compliance. Led legal teams through IPOs, acquisitions, and regulatory investigations. Expert in securities law, corporate governance, and litigation management. Board member at two public companies.",
        "years_experience": 23,
        "board_count": 2,
        "industries": ["Legal", "Corporate Governance", "Compliance"],
        "skills": ["Securities Law", "Corporate Governance", "M&A Legal", "Regulatory Affairs"]
    },
    {
        "name": "Kevin Park",
        "title": "Chief Revenue Officer",
        "company": "SalesForce Dynamics",
        "bio": "Sales executive with 19 years scaling enterprise revenue teams. Built sales organizations from $10M to $500M+ ARR. Expert in go-to-market strategy, channel partnerships, and sales operations. Board advisor for four SaaS companies.",
        "years_experience": 19,
        "board_count": 4,
        "industries": ["SaaS", "Enterprise Sales", "Revenue Operations"],
        "skills": ["Enterprise Sales", "Go-to-Market", "Channel Partnerships", "Revenue Strategy"]
    },
    {
        "name": "Rachel Foster",
        "title": "Chief Sustainability Officer",
        "company": "GreenTech Ventures",
        "bio": "Sustainability leader with 14 years driving ESG initiatives. Led carbon reduction programs saving 10M+ tons CO2. Expert in sustainability reporting, climate strategy, and stakeholder engagement. Board member at two environmental organizations.",
        "years_experience": 14,
        "board_count": 2,
        "industries": ["Sustainability", "ESG", "Clean Technology"],
        "skills": ["ESG Strategy", "Carbon Reduction", "Sustainability Reporting", "Stakeholder Engagement"]
    },
    {
        "name": "Samuel Lee",
        "title": "Chief Data Officer",
        "company": "DataVision Analytics",
        "bio": "Data executive with 18 years building enterprise data platforms. Led data transformation at three Fortune 500 companies. Expert in data governance, analytics, and AI/ML infrastructure. Former board advisor for two data-driven startups.",
        "years_experience": 18,
        "board_count": 2,
        "industries": ["Data Analytics", "AI/ML", "Business Intelligence"],
        "skills": ["Data Governance", "Analytics", "Machine Learning", "Data Strategy"]
    },
    {
        "name": "Nicole Johnson",
        "title": "Chief Customer Officer",
        "company": "CustomerFirst Solutions",
        "bio": "Customer experience leader with 16 years transforming customer success organizations. Improved NPS scores by 40+ points. Expert in customer retention, support operations, and community building. Board member at two customer-focused tech companies.",
        "years_experience": 16,
        "board_count": 2,
        "industries": ["Customer Success", "SaaS", "Support Operations"],
        "skills": ["Customer Success", "NPS Optimization", "Support Operations", "Community Building"]
    },
    {
        "name": "Gregory Moore",
        "title": "Chief Supply Chain Officer",
        "company": "LogiTech Global",
        "bio": "Supply chain executive with 24 years optimizing global operations. Managed $2B+ supply chain budgets. Expert in procurement, logistics, and supply chain resilience. Served on boards of three logistics and manufacturing companies.",
        "years_experience": 24,
        "board_count": 3,
        "industries": ["Supply Chain", "Logistics", "Manufacturing"],
        "skills": ["Procurement", "Logistics", "Supply Chain Optimization", "Risk Management"]
    }
]

# 15 More Boards
BOARDS = [
    {
        "company_name": "QuantumCloud Systems",
        "ticker": "QCLD",
        "sector": "Technology",
        "description": "Leading provider of quantum computing cloud services. Seeking board members with expertise in emerging technologies, enterprise sales, and scaling infrastructure businesses.",
        "last_proxy_date": "2025-04-15"
    },
    {
        "company_name": "MedTech Innovations",
        "ticker": "MTCH",
        "sector": "Healthcare",
        "description": "Medical device company developing next-generation diagnostic tools. Looking for board members with FDA regulatory experience, clinical expertise, and healthcare commercialization background.",
        "last_proxy_date": "2025-03-20"
    },
    {
        "company_name": "GreenEnergy Solutions",
        "ticker": "GREN",
        "sector": "Energy",
        "description": "Renewable energy company focused on solar and wind power. Seeking board members with experience in energy infrastructure, project finance, and sustainability initiatives.",
        "last_proxy_date": "2025-05-10"
    },
    {
        "company_name": "RetailNext Technologies",
        "ticker": "RNXT",
        "sector": "Retail",
        "description": "E-commerce platform for next-generation retail experiences. Looking for board members with digital transformation expertise, supply chain management, and consumer insights.",
        "last_proxy_date": "2025-02-28"
    },
    {
        "company_name": "CyberShield Corp",
        "ticker": "CYSH",
        "sector": "Cybersecurity",
        "description": "Enterprise cybersecurity solutions provider. Seeking board members with security architecture expertise, government contracting experience, and enterprise sales background.",
        "last_proxy_date": "2025-06-01"
    },
    {
        "company_name": "FinanceFirst Bank",
        "ticker": "FFBN",
        "sector": "Finance",
        "description": "Regional banking institution expanding digital services. Looking for board members with banking regulation expertise, digital transformation experience, and risk management background.",
        "last_proxy_date": "2025-03-15"
    },
    {
        "company_name": "EduTech Learning",
        "ticker": "EDTC",
        "sector": "Education",
        "description": "Online education platform for K-12 and higher education. Seeking board members with EdTech experience, curriculum development expertise, and scaling SaaS platforms.",
        "last_proxy_date": "2025-04-30"
    },
    {
        "company_name": "LogiChain Global",
        "ticker": "LOGC",
        "sector": "Logistics",
        "description": "Supply chain technology and logistics services company. Looking for board members with operations expertise, international expansion experience, and technology integration skills.",
        "last_proxy_date": "2025-05-20"
    },
    {
        "company_name": "BioGenetics Research",
        "ticker": "BIOG",
        "sector": "Biotechnology",
        "description": "Biotech company developing gene therapy treatments. Seeking board members with clinical trial expertise, regulatory affairs experience, and pharmaceutical commercialization background.",
        "last_proxy_date": "2025-01-25"
    },
    {
        "company_name": "PropTech Ventures",
        "ticker": "PROP",
        "sector": "Real Estate",
        "description": "Real estate technology platform for commercial properties. Looking for board members with real estate expertise, PropTech experience, and institutional investment background.",
        "last_proxy_date": "2025-07-10"
    },
    {
        "company_name": "AgriTech Farms",
        "ticker": "AGRI",
        "sector": "Agriculture",
        "description": "Agricultural technology company using AI for precision farming. Seeking board members with agriculture expertise, sustainability experience, and IoT technology background.",
        "last_proxy_date": "2025-06-15"
    },
    {
        "company_name": "SpaceTech Industries",
        "ticker": "SPTC",
        "sector": "Aerospace",
        "description": "Aerospace company developing satellite technology. Looking for board members with aerospace engineering experience, government contracts expertise, and space industry background.",
        "last_proxy_date": "2025-08-01"
    },
    {
        "company_name": "MediaStream Plus",
        "ticker": "MSTR",
        "sector": "Media",
        "description": "Streaming media platform for premium content. Seeking board members with media industry expertise, content acquisition experience, and subscription business models.",
        "last_proxy_date": "2025-03-10"
    },
    {
        "company_name": "InsureTech Solutions",
        "ticker": "INST",
        "sector": "Insurance",
        "description": "Insurance technology company modernizing claims processing. Looking for board members with insurance industry experience, regulatory compliance expertise, and digital transformation background.",
        "last_proxy_date": "2025-04-05"
    },
    {
        "company_name": "AutoDrive Systems",
        "ticker": "AUTO",
        "sector": "Automotive",
        "description": "Autonomous vehicle technology company. Seeking board members with automotive expertise, AI/ML experience, and regulatory affairs background in transportation.",
        "last_proxy_date": "2025-09-20"
    }
]

def add_test_data():
    db = next(get_db())
    
    print("🚀 Adding 15 test candidates (FAST - no rate limits!)...")
    for data in CANDIDATES:
        try:
            print(f"  Generating embedding for {data['name']}...")
            bio_embedding = claude_service.generate_embedding(data['bio'])
            
            candidate = Candidate(
                name=data['name'],
                title=data['title'],
                company=data['company'],
                bio=data['bio'],
                bio_embedding=bio_embedding,
                years_experience=data['years_experience'],
                board_count=data['board_count'],
                industries=data['industries'],
                skills=data['skills']
            )
            db.add(candidate)
            print(f"  ✅ Added {data['name']}")
        except Exception as e:
            print(f"  ❌ Error adding {data['name']}: {e}")
    
    print("\n🏢 Adding 15 test boards...")
    for data in BOARDS:
        try:
            print(f"  Generating embedding for {data['company_name']}...")
            description_embedding = claude_service.generate_embedding(data['description'])
            
            board = Board(
                company_name=data['company_name'],
                ticker=data.get('ticker'),
                sector=data['sector'],
                description=data['description'],
                description_embedding=description_embedding,
                last_proxy_date=data.get('last_proxy_date')
            )
            db.add(board)
            print(f"  ✅ Added {data['company_name']}")
        except Exception as e:
            print(f"  ❌ Error adding {data['company_name']}: {e}")
    
    db.commit()
    print("\n✅ Test data added successfully!")
    print(f"   Total candidates: {len(CANDIDATES) + 2}")
    print(f"   Total boards: {len(BOARDS) + 2}")

if __name__ == "__main__":
    add_test_data()
