from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.models import UsageEvent, VirtualKey, User
from app.schemas import MetricsOverview, CostOverview, TopUser, TopProject, WasteMetrics
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/overview", response_model=MetricsOverview)
async def get_metrics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive metrics overview"""
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)
    year_start = datetime(now.year, 1, 1)
    
    # Base query - filter by user if not admin
    base_query = db.query(UsageEvent)
    if not current_user.is_admin:
        base_query = base_query.join(VirtualKey).filter(
            VirtualKey.user_email == current_user.email
        )
    
    # Cost overview
    spend_today = base_query.filter(
        UsageEvent.created_at >= today_start
    ).with_entities(func.sum(UsageEvent.total_cost)).scalar() or 0.0
    
    spend_mtd = base_query.filter(
        UsageEvent.created_at >= month_start
    ).with_entities(func.sum(UsageEvent.total_cost)).scalar() or 0.0
    
    spend_ytd = base_query.filter(
        UsageEvent.created_at >= year_start
    ).with_entities(func.sum(UsageEvent.total_cost)).scalar() or 0.0
    
    # Forecast month-end (simple: average daily spend * days remaining)
    days_elapsed = (now - month_start).days + 1
    days_in_month = (datetime(now.year, now.month + 1, 1) - timedelta(days=1)).day
    avg_daily = spend_mtd / days_elapsed if days_elapsed > 0 else 0
    forecasted_month_end = avg_daily * days_in_month
    
    # Request and token counts
    total_requests = base_query.filter(
        UsageEvent.created_at >= month_start
    ).count()
    
    total_tokens = base_query.filter(
        UsageEvent.created_at >= month_start
    ).with_entities(func.sum(UsageEvent.total_tokens)).scalar() or 0
    
    cost_overview = CostOverview(
        spend_today=round(spend_today, 2),
        spend_mtd=round(spend_mtd, 2),
        spend_ytd=round(spend_ytd, 2),
        forecasted_month_end=round(forecasted_month_end, 2),
        total_requests=total_requests,
        total_tokens=total_tokens
    )
    
    # Top users (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    user_query = base_query.filter(UsageEvent.created_at >= thirty_days_ago)
    
    if current_user.is_admin:
        top_users_data = db.query(
            VirtualKey.user_email,
            func.sum(UsageEvent.total_cost).label('total_cost'),
            func.count(UsageEvent.id).label('request_count')
        ).join(
            UsageEvent, VirtualKey.id == UsageEvent.virtual_key_id
        ).filter(
            UsageEvent.created_at >= thirty_days_ago,
            VirtualKey.user_email.isnot(None)
        ).group_by(
            VirtualKey.user_email
        ).order_by(
            func.sum(UsageEvent.total_cost).desc()
        ).limit(10).all()
        
        top_users = [
            TopUser(
                user_email=row.user_email,
                total_cost=round(row.total_cost, 2),
                request_count=row.request_count
            )
            for row in top_users_data
        ]
    else:
        top_users = []
    
    # Top projects (last 30 days)
    from app.models import Project
    project_query = db.query(
        Project.name,
        func.sum(UsageEvent.total_cost).label('total_cost'),
        func.count(UsageEvent.id).label('request_count')
    ).join(
        VirtualKey, Project.id == VirtualKey.project_id
    ).join(
        UsageEvent, VirtualKey.id == UsageEvent.virtual_key_id
    ).filter(
        UsageEvent.created_at >= thirty_days_ago
    )
    
    if not current_user.is_admin:
        project_query = project_query.filter(VirtualKey.user_email == current_user.email)
    
    top_projects_data = project_query.group_by(
        Project.name
    ).order_by(
        func.sum(UsageEvent.total_cost).desc()
    ).limit(10).all()
    
    top_projects = [
        TopProject(
            project_name=row.name,
            total_cost=round(row.total_cost, 2),
            request_count=row.request_count
        )
        for row in top_projects_data
    ]
    
    # Waste detection (repeated prompts in last 7 days)
    seven_days_ago = now - timedelta(days=7)
    waste_query = base_query.filter(
        UsageEvent.created_at >= seven_days_ago,
        UsageEvent.prompt_hash.isnot(None)
    )
    
    # Find repeated prompt hashes
    repeated_hashes = db.query(
        UsageEvent.prompt_hash,
        func.count(UsageEvent.id).label('count'),
        func.sum(UsageEvent.total_cost).label('total_cost')
    ).filter(
        UsageEvent.created_at >= seven_days_ago,
        UsageEvent.prompt_hash.isnot(None)
    )
    
    if not current_user.is_admin:
        repeated_hashes = repeated_hashes.join(VirtualKey).filter(
            VirtualKey.user_email == current_user.email
        )
    
    repeated_hashes = repeated_hashes.group_by(
        UsageEvent.prompt_hash
    ).having(
        func.count(UsageEvent.id) > 1
    ).order_by(
        func.count(UsageEvent.id).desc()
    ).limit(10).all()
    
    repeated_prompts_count = sum(row.count - 1 for row in repeated_hashes)  # Subtract 1 for first occurrence
    estimated_waste = sum((row.count - 1) * (row.total_cost / row.count) for row in repeated_hashes)
    
    top_repeated_hashes = [
        {
            "hash": row.prompt_hash[:16] + "...",
            "count": row.count,
            "estimated_waste": round((row.count - 1) * (row.total_cost / row.count), 2)
        }
        for row in repeated_hashes
    ]
    
    waste_metrics = WasteMetrics(
        repeated_prompts_count=repeated_prompts_count,
        estimated_waste=round(estimated_waste, 2),
        top_repeated_hashes=top_repeated_hashes
    )
    
    return MetricsOverview(
        cost=cost_overview,
        top_users=top_users,
        top_projects=top_projects,
        waste=waste_metrics
    )
