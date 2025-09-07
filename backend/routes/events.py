from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Event, EventCreate, EventWithCollege
from database import (
    execute_query, execute_insert, get_event_by_id, 
    get_event_with_college, check_record_exists
)

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[Event])
async def get_events(college_id: Optional[int] = Query(None, description="Filter by college ID")):
    """Get all events, optionally filtered by college_id"""
    try:
        if college_id:
            # Check if college exists
            if not check_record_exists("Colleges", "College_id", college_id):
                raise HTTPException(status_code=400, detail="College not found")
            
            query = """
            SELECT event_id, name, type, date, capacity, description, college_id, created_by
            FROM Events WHERE college_id = ?
            """
            events = execute_query(query, (college_id,))
        else:
            query = """
            SELECT event_id, name, type, date, capacity, description, college_id, created_by
            FROM Events
            """
            events = execute_query(query)
        
        return events
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: int):
    """Get a specific event by ID"""
    try:
        event = get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/", response_model=Event)
async def create_event(event: EventCreate):
    """Create a new event"""
    try:
        # Check if college exists
        if not check_record_exists("Colleges", "College_id", event.college_id):
            raise HTTPException(status_code=400, detail="College not found")
        
        query = """
        INSERT INTO Events (name, type, date, capacity, description, college_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        event_id = execute_insert(query, (
            event.name, event.type, event.date, event.capacity,
            event.description, event.college_id, event.created_by
        ))
        
        # Return the created event
        created_event = get_event_by_id(event_id)
        return created_event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
