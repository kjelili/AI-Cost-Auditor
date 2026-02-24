"""Seed script to create initial data"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Organization, Team, Project, VirtualKey
from app.auth import get_password_hash

def seed_data():
    """Seed the database with initial data"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = db.query(User).filter(User.email == "admin@local").first()
        if not admin_user:
            admin_user = User(
                email="admin@local",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("✓ Created admin user: admin@local / admin123")
        else:
            print("✓ Admin user already exists")
        
        # Create organization
        org = db.query(Organization).filter(Organization.name == "Default Organization").first()
        if not org:
            org = Organization(name="Default Organization")
            db.add(org)
            db.commit()
            db.refresh(org)
            print("✓ Created default organization")
        else:
            print("✓ Default organization already exists")
        
        # Create team
        team = db.query(Team).filter(Team.name == "Engineering").first()
        if not team:
            team = Team(name="Engineering", organization_id=org.id)
            db.add(team)
            db.commit()
            db.refresh(team)
            print("✓ Created Engineering team")
        else:
            print("✓ Engineering team already exists")
        
        # Create project
        project = db.query(Project).filter(Project.name == "AI Chatbot").first()
        if not project:
            project = Project(
                name="AI Chatbot",
                organization_id=org.id,
                team_id=team.id
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print("✓ Created AI Chatbot project")
        else:
            print("✓ AI Chatbot project already exists")
        
        # Create demo virtual key
        demo_vk = db.query(VirtualKey).filter(VirtualKey.name == "Demo Key").first()
        if not demo_vk:
            demo_vk = VirtualKey(
                key="vk_demo_key_for_testing_only",
                name="Demo Key",
                team_id=team.id,
                project_id=project.id,
                user_email="admin@local",
                environment="dev",
                monthly_budget_cap=1000.0,
                max_tokens_per_request=10000,
                created_by=admin_user.id
            )
            db.add(demo_vk)
            db.commit()
            print("✓ Created demo virtual key: vk_demo_key_for_testing_only")
        else:
            print("✓ Demo virtual key already exists")
        
        print("\n✅ Seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
