from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import secrets
import string

from app.database import get_db
from app.models import VirtualKey, UsageEvent
from app.schemas import VirtualKeyCreate, VirtualKeyResponse, UsageEventResponse
from app.auth import get_current_admin_user, get_current_active_user, get_current_user
from app.models import User

router = APIRouter()

def generate_virtual_key() -> str:
    """Generate a secure virtual key"""
    alphabet = string.ascii_letters + string.digits
    return "vk_" + ''.join(secrets.choice(alphabet) for _ in range(32))

@router.post("/virtual-keys", response_model=VirtualKeyResponse)
async def create_virtual_key(
    vk_data: VirtualKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new virtual key"""
    # Generate unique key
    key = generate_virtual_key()
    while db.query(VirtualKey).filter(VirtualKey.key == key).first():
        key = generate_virtual_key()
    
    virtual_key = VirtualKey(
        key=key,
        name=vk_data.name,
        team_id=vk_data.team_id,
        project_id=vk_data.project_id,
        user_email=vk_data.user_email,
        cost_centre=vk_data.cost_centre,
        environment=vk_data.environment,
        agent_name=vk_data.agent_name,
        monthly_budget_cap=vk_data.monthly_budget_cap,
        max_tokens_per_request=vk_data.max_tokens_per_request,
        max_reasoning_tokens=vk_data.max_reasoning_tokens,
        created_by=current_user.id
    )
    
    db.add(virtual_key)
    db.commit()
    db.refresh(virtual_key)
    
    return virtual_key

@router.get("/virtual-keys", response_model=List[VirtualKeyResponse])
async def list_virtual_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all virtual keys (admin sees all, regular users see their own)"""
    if current_user.is_admin:
        virtual_keys = db.query(VirtualKey).all()
    else:
        virtual_keys = db.query(VirtualKey).filter(
            VirtualKey.user_email == current_user.email
        ).all()
    
    return virtual_keys

@router.get("/virtual-keys/{key_id}", response_model=VirtualKeyResponse)
async def get_virtual_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific virtual key"""
    virtual_key = db.query(VirtualKey).filter(VirtualKey.id == key_id).first()
    if not virtual_key:
        raise HTTPException(status_code=404, detail="Virtual key not found")
    
    # Check permissions
    if not current_user.is_admin and virtual_key.user_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return virtual_key

@router.get("/usage-events", response_model=List[UsageEventResponse])
async def list_usage_events(
    limit: int = 100,
    virtual_key_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List recent usage events"""
    query = db.query(UsageEvent)
    
    # Filter by virtual key if specified
    if virtual_key_id:
        query = query.filter(UsageEvent.virtual_key_id == virtual_key_id)
        # Check permissions
        vk = db.query(VirtualKey).filter(VirtualKey.id == virtual_key_id).first()
        if vk and not current_user.is_admin and vk.user_email != current_user.email:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    # Non-admins only see their own events
    if not current_user.is_admin:
        query = query.join(VirtualKey).filter(
            VirtualKey.user_email == current_user.email
        )
    
    events = query.order_by(UsageEvent.created_at.desc()).limit(limit).all()
    return events
