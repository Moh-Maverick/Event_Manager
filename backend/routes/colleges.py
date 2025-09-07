from fastapi import APIRouter, HTTPException
from typing import List
from models import College
from database import execute_query, get_college_by_id

router = APIRouter(prefix="/colleges", tags=["colleges"])


@router.get("/", response_model=List[College])
async def get_colleges():
    """Get all colleges"""
    try:
        query = "SELECT College_id as college_id, name, location FROM Colleges"
        colleges = execute_query(query)
        return colleges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{college_id}", response_model=College)
async def get_college(college_id: int):
    """Get a specific college by ID"""
    try:
        college = get_college_by_id(college_id)
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
        
        # Convert College_id to college_id for consistency
        college['college_id'] = college.pop('College_id')
        return college
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
