from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_admin: bool
    
    class Config:
        from_attributes = True

# Virtual Key schemas
class VirtualKeyCreate(BaseModel):
    name: str
    team_id: Optional[int] = None
    project_id: Optional[int] = None
    user_email: Optional[str] = None
    cost_centre: Optional[str] = None
    environment: Optional[str] = None
    agent_name: Optional[str] = None
    monthly_budget_cap: Optional[float] = None
    max_tokens_per_request: Optional[int] = None
    max_reasoning_tokens: Optional[int] = None

class VirtualKeyResponse(BaseModel):
    id: int
    key: str
    name: str
    team_id: Optional[int]
    project_id: Optional[int]
    user_email: Optional[str]
    cost_centre: Optional[str]
    environment: Optional[str]
    agent_name: Optional[str]
    monthly_budget_cap: Optional[float]
    max_tokens_per_request: Optional[int]
    max_reasoning_tokens: Optional[int]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Usage Event schemas
class UsageEventResponse(BaseModel):
    id: int
    virtual_key_id: int
    user_id: Optional[int]
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: float
    output_cost: float
    total_cost: float
    prompt_hash: Optional[str]
    status_code: Optional[int]
    was_blocked: bool
    block_reason: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Metrics schemas
class CostOverview(BaseModel):
    spend_today: float
    spend_mtd: float
    spend_ytd: float
    forecasted_month_end: float
    total_requests: int
    total_tokens: int

class TopUser(BaseModel):
    user_email: str
    total_cost: float
    request_count: int

class TopProject(BaseModel):
    project_name: str
    total_cost: float
    request_count: int

class WasteMetrics(BaseModel):
    repeated_prompts_count: int
    estimated_waste: float
    top_repeated_hashes: List[dict]

class MetricsOverview(BaseModel):
    cost: CostOverview
    top_users: List[TopUser]
    top_projects: List[TopProject]
    waste: WasteMetrics
