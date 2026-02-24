import httpx
from fastapi import APIRouter, Header, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

from app.database import get_db
from app.models import VirtualKey, UsageEvent, User
from app.utils import calculate_cost, hash_prompt, extract_prompt_preview, check_budget_limits, detect_repeated_prompts
from app.config import settings

router = APIRouter()

async def get_virtual_key(
    x_virtual_key: Optional[str] = Header(None, alias="X-Virtual-Key"),
    db: Session = Depends(get_db)
) -> VirtualKey:
    """Get and validate virtual key from header"""
    if not x_virtual_key:
        raise HTTPException(status_code=401, detail="X-Virtual-Key header required")
    
    virtual_key = db.query(VirtualKey).filter(VirtualKey.key == x_virtual_key).first()
    if not virtual_key:
        raise HTTPException(status_code=401, detail="Invalid virtual key")
    
    # Check budget limits
    allowed, reason = check_budget_limits(db, virtual_key)
    if not allowed:
        raise HTTPException(status_code=403, detail=reason)
    
    return virtual_key

@router.post("/openai/v1/chat/completions")
async def proxy_openai(
    request: Request,
    virtual_key: VirtualKey = Depends(get_virtual_key),
    db: Session = Depends(get_db)
):
    """Proxy OpenAI chat completions endpoint"""
    body = await request.json()
    model = body.get("model", "gpt-4o-mini")
    messages = body.get("messages", [])
    
    # Check token limits
    if virtual_key.max_tokens_per_request:
        # Estimate tokens (rough: 1 token ≈ 4 chars)
        estimated_tokens = sum(len(str(msg.get("content", ""))) for msg in messages) // 4
        if estimated_tokens > virtual_key.max_tokens_per_request:
            raise HTTPException(
                status_code=400,
                detail=f"Request exceeds max tokens limit of {virtual_key.max_tokens_per_request}"
            )
    
    # Hash prompt for waste detection
    prompt_hash = hash_prompt(messages=messages, model=model)
    prompt_preview, prompt_chars = extract_prompt_preview(messages=messages)
    
    # Forward to OpenAI
    openai_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    request_id = str(uuid.uuid4())
    was_blocked = False
    block_reason = None
    status_code = 200
    input_tokens = 0
    output_tokens = 0
    total_tokens = 0
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(openai_url, json=body, headers=headers)
            status_code = response.status_code
            
            if response.status_code == 200:
                data = response.json()
                usage = data.get("usage", {})
                input_tokens = usage.get("prompt_tokens", 0)
                output_tokens = usage.get("completion_tokens", 0)
                total_tokens = usage.get("total_tokens", 0)
                
                # Check reasoning tokens if limit set
                if virtual_key.max_reasoning_tokens and output_tokens > virtual_key.max_reasoning_tokens:
                    # This is a soft check - we log it but don't block
                    pass
                
                # Calculate costs
                costs = calculate_cost("openai", model, input_tokens, output_tokens)
                
                # Log usage event
                usage_event = UsageEvent(
                    virtual_key_id=virtual_key.id,
                    provider="openai",
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    input_cost=costs["input_cost"],
                    output_cost=costs["output_cost"],
                    total_cost=costs["total_cost"],
                    prompt_hash=prompt_hash,
                    prompt_chars=prompt_chars,
                    prompt_preview=prompt_preview[:200],
                    request_id=request_id,
                    status_code=status_code,
                    was_blocked=was_blocked,
                    block_reason=block_reason
                )
                db.add(usage_event)
                db.commit()
                
                return JSONResponse(content=data, status_code=200)
            else:
                # Log failed request
                usage_event = UsageEvent(
                    virtual_key_id=virtual_key.id,
                    provider="openai",
                    model=model,
                    input_tokens=0,
                    output_tokens=0,
                    total_tokens=0,
                    input_cost=0.0,
                    output_cost=0.0,
                    total_cost=0.0,
                    prompt_hash=prompt_hash,
                    prompt_chars=prompt_chars,
                    prompt_preview=prompt_preview[:200],
                    request_id=request_id,
                    status_code=status_code,
                    was_blocked=False
                )
                db.add(usage_event)
                db.commit()
                
                return JSONResponse(content=response.json(), status_code=status_code)
    
    except Exception as e:
        # Log error
        usage_event = UsageEvent(
            virtual_key_id=virtual_key.id,
            provider="openai",
            model=model,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            input_cost=0.0,
            output_cost=0.0,
            total_cost=0.0,
            prompt_hash=prompt_hash,
            prompt_chars=prompt_chars,
            prompt_preview=prompt_preview[:200],
            request_id=request_id,
            status_code=500,
            was_blocked=False
        )
        db.add(usage_event)
        db.commit()
        
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/anthropic/v1/messages")
async def proxy_anthropic(
    request: Request,
    virtual_key: VirtualKey = Depends(get_virtual_key),
    db: Session = Depends(get_db)
):
    """Proxy Anthropic messages endpoint"""
    body = await request.json()
    model = body.get("model", "claude-3-5-sonnet-20241022")
    messages = body.get("messages", [])
    
    # Check token limits
    if virtual_key.max_tokens_per_request:
        estimated_tokens = sum(len(str(msg.get("content", ""))) for msg in messages) // 4
        if estimated_tokens > virtual_key.max_tokens_per_request:
            raise HTTPException(
                status_code=400,
                detail=f"Request exceeds max tokens limit of {virtual_key.max_tokens_per_request}"
            )
    
    # Hash prompt for waste detection
    prompt_hash = hash_prompt(messages=messages, model=model)
    prompt_preview, prompt_chars = extract_prompt_preview(messages=messages)
    
    # Forward to Anthropic
    anthropic_url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    request_id = str(uuid.uuid4())
    status_code = 200
    input_tokens = 0
    output_tokens = 0
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(anthropic_url, json=body, headers=headers)
            status_code = response.status_code
            
            if response.status_code == 200:
                data = response.json()
                usage = data.get("usage", {})
                input_tokens = usage.get("input_tokens", 0)
                output_tokens = usage.get("output_tokens", 0)
                total_tokens = input_tokens + output_tokens
                
                # Calculate costs
                costs = calculate_cost("anthropic", model, input_tokens, output_tokens)
                
                # Log usage event
                usage_event = UsageEvent(
                    virtual_key_id=virtual_key.id,
                    provider="anthropic",
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    input_cost=costs["input_cost"],
                    output_cost=costs["output_cost"],
                    total_cost=costs["total_cost"],
                    prompt_hash=prompt_hash,
                    prompt_chars=prompt_chars,
                    prompt_preview=prompt_preview[:200],
                    request_id=request_id,
                    status_code=status_code,
                    was_blocked=False
                )
                db.add(usage_event)
                db.commit()
                
                return JSONResponse(content=data, status_code=200)
            else:
                # Log failed request
                usage_event = UsageEvent(
                    virtual_key_id=virtual_key.id,
                    provider="anthropic",
                    model=model,
                    input_tokens=0,
                    output_tokens=0,
                    total_tokens=0,
                    input_cost=0.0,
                    output_cost=0.0,
                    total_cost=0.0,
                    prompt_hash=prompt_hash,
                    prompt_chars=prompt_chars,
                    prompt_preview=prompt_preview[:200],
                    request_id=request_id,
                    status_code=status_code,
                    was_blocked=False
                )
                db.add(usage_event)
                db.commit()
                
                return JSONResponse(content=response.json(), status_code=status_code)
    
    except Exception as e:
        # Log error
        usage_event = UsageEvent(
            virtual_key_id=virtual_key.id,
            provider="anthropic",
            model=model,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            input_cost=0.0,
            output_cost=0.0,
            total_cost=0.0,
            prompt_hash=prompt_hash,
            prompt_chars=prompt_chars,
            prompt_preview=prompt_preview[:200],
            request_id=request_id,
            status_code=500,
            was_blocked=False
        )
        db.add(usage_event)
        db.commit()
        
        raise HTTPException(status_code=500, detail=str(e))
