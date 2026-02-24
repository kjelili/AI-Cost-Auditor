import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import UsageEvent, VirtualKey
from app.config import settings

def calculate_cost(provider: str, model: str, input_tokens: int, output_tokens: int) -> Dict[str, float]:
    """Calculate cost based on provider, model, and token usage"""
    pricing = settings.OPENAI_PRICING if provider == "openai" else settings.ANTHROPIC_PRICING
    
    if model not in pricing:
        # Default pricing if model not found
        default_input = 1.0
        default_output = 3.0
    else:
        default_input = pricing[model]["input"]
        default_output = pricing[model]["output"]
    
    input_cost = (input_tokens / 1_000_000) * default_input
    output_cost = (output_tokens / 1_000_000) * default_output
    total_cost = input_cost + output_cost
    
    return {
        "input_cost": round(input_cost, 6),
        "output_cost": round(output_cost, 6),
        "total_cost": round(total_cost, 6)
    }

def hash_prompt(messages: Optional[list] = None, prompt: Optional[str] = None, model: str = "") -> str:
    """Create a hash of the prompt for duplicate detection"""
    content = ""
    if messages:
        # Extract content from messages
        content = " ".join([msg.get("content", "") for msg in messages if isinstance(msg, dict)])
    elif prompt:
        content = prompt
    
    # Include model in hash for better detection
    content_with_model = f"{model}:{content}"
    return hashlib.sha256(content_with_model.encode()).hexdigest()

def extract_prompt_preview(messages: Optional[list] = None, prompt: Optional[str] = None, max_chars: int = 200) -> tuple[str, int]:
    """Extract a preview of the prompt and its character count"""
    content = ""
    if messages:
        content = " ".join([msg.get("content", "") for msg in messages if isinstance(msg, dict)])
    elif prompt:
        content = prompt
    
    char_count = len(content)
    preview = content[:max_chars] if len(content) > max_chars else content
    return preview, char_count

def check_budget_limits(db: Session, virtual_key: VirtualKey) -> tuple[bool, Optional[str]]:
    """Check if virtual key has exceeded budget limits"""
    if not virtual_key.is_active:
        return False, "Virtual key is inactive"
    
    # Check monthly budget cap
    if virtual_key.monthly_budget_cap:
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        
        monthly_spend = db.query(
            func.sum(UsageEvent.total_cost)
        ).filter(
            UsageEvent.virtual_key_id == virtual_key.id,
            UsageEvent.created_at >= month_start
        ).scalar() or 0.0
        
        if monthly_spend >= virtual_key.monthly_budget_cap:
            return False, f"Monthly budget cap of ${virtual_key.monthly_budget_cap} exceeded"
    
    return True, None

def detect_repeated_prompts(db: Session, prompt_hash: str, hours: int = 24) -> int:
    """Detect how many times this prompt hash has been used recently"""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    count = db.query(UsageEvent).filter(
        UsageEvent.prompt_hash == prompt_hash,
        UsageEvent.created_at >= cutoff
    ).count()
    return count
