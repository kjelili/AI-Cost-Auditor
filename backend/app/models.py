from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import hashlib

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    teams = relationship("Team", back_populates="organization")
    projects = relationship("Project", back_populates="organization")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organization = relationship("Organization", back_populates="teams")
    projects = relationship("Project", back_populates="team")
    virtual_keys = relationship("VirtualKey", back_populates="team")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organization = relationship("Organization", back_populates="projects")
    team = relationship("Team", back_populates="projects")
    virtual_keys = relationship("VirtualKey", back_populates="project")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    usage_events = relationship("UsageEvent", back_populates="user")

class VirtualKey(Base):
    __tablename__ = "virtual_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    cost_centre = Column(String(255), nullable=True)
    environment = Column(String(50), nullable=True)  # dev, staging, prod
    agent_name = Column(String(255), nullable=True)
    
    # Budget controls
    monthly_budget_cap = Column(Float, nullable=True)  # in USD
    max_tokens_per_request = Column(Integer, nullable=True)
    max_reasoning_tokens = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    team = relationship("Team", back_populates="virtual_keys")
    project = relationship("Project", back_populates="virtual_keys")
    usage_events = relationship("UsageEvent", back_populates="virtual_key")

class UsageEvent(Base):
    __tablename__ = "usage_events"
    
    id = Column(Integer, primary_key=True, index=True)
    virtual_key_id = Column(Integer, ForeignKey("virtual_keys.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Provider info
    provider = Column(String(50), nullable=False)  # openai, anthropic
    model = Column(String(100), nullable=False)
    
    # Token usage
    input_tokens = Column(Integer, nullable=False, default=0)
    output_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)
    
    # Cost calculation
    input_cost = Column(Float, nullable=False, default=0.0)
    output_cost = Column(Float, nullable=False, default=0.0)
    total_cost = Column(Float, nullable=False, default=0.0)
    
    # Waste detection
    prompt_hash = Column(String(64), nullable=True, index=True)
    prompt_chars = Column(Integer, nullable=True)
    prompt_preview = Column(Text, nullable=True)  # First 200 chars, configurable
    
    # Request metadata
    request_id = Column(String(255), nullable=True)
    status_code = Column(Integer, nullable=True)
    was_blocked = Column(Boolean, default=False)
    block_reason = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    virtual_key = relationship("VirtualKey", back_populates="usage_events")
    user = relationship("User", back_populates="usage_events")

# Indexes for performance
Index('idx_usage_events_created_at', UsageEvent.created_at)
Index('idx_usage_events_virtual_key_created', UsageEvent.virtual_key_id, UsageEvent.created_at)
Index('idx_usage_events_prompt_hash', UsageEvent.prompt_hash)
