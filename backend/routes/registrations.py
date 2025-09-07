from fastapi import APIRouter, HTTPException
from typing import List
from models import Registration, RegistrationCreate, RegistrationWithDetails
from database import (
    execute_query, execute_insert, get_registration_by_id,
    get_registration_with_details, check_record_exists,
    get_registration_count_for_event
)

router = APIRouter(prefix="/registrations", tags=["registrations"])


@router.post("/", response_model=Registration)
async def create_registration(registration: RegistrationCreate):
    """Register a student for an event"""
    try:
        # Check if student exists
        if not check_record_exists("Students", "student_id", registration.student_id):
            raise HTTPException(status_code=400, detail="Student not found")
        
        # Check if event exists
        if not check_record_exists("Events", "event_id", registration.event_id):
            raise HTTPException(status_code=400, detail="Event not found")
        
        # Check if student is already registered for this event
        existing_registration = execute_query(
            "SELECT registration_id FROM Registrations WHERE student_id = ? AND event_id = ?",
            (registration.student_id, registration.event_id)
        )
        if existing_registration:
            raise HTTPException(status_code=400, detail="Student already registered for this event")
        
        # Get event capacity and current registrations
        event = execute_query("SELECT capacity FROM Events WHERE event_id = ?", (registration.event_id,))
        if not event:
            raise HTTPException(status_code=400, detail="Event not found")
        
        capacity = event[0]['capacity']
        current_registrations = get_registration_count_for_event(registration.event_id)
        
        # Determine status based on capacity
        status = "Waitlisted" if current_registrations >= capacity else "Registered"
        
        query = """
        INSERT INTO Registrations (student_id, event_id, status, timestamp)
        VALUES (?, ?, ?, datetime('now'))
        """
        registration_id = execute_insert(query, (
            registration.student_id, registration.event_id, status
        ))
        
        # Return the created registration
        created_registration = get_registration_by_id(registration_id)
        return created_registration
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/student/{student_id}", response_model=List[RegistrationWithDetails])
async def get_student_registrations(student_id: int):
    """Get all events a student has registered for"""
    try:
        # Check if student exists
        if not check_record_exists("Students", "student_id", student_id):
            raise HTTPException(status_code=404, detail="Student not found")
        
        query = """
        SELECT r.*, s.name as student_name, s.email as student_email, s.college_id as student_college_id,
               e.name as event_name, e.type as event_type, e.date as event_date, e.capacity, e.description, e.college_id as event_college_id, e.created_by,
               c.name as college_name
        FROM Registrations r
        JOIN Students s ON r.student_id = s.student_id
        JOIN Events e ON r.event_id = e.event_id
        JOIN Colleges c ON s.college_id = c.College_id
        WHERE r.student_id = ?
        ORDER BY r.timestamp DESC
        """
        registrations = execute_query(query, (student_id,))
        
        # Transform the data to match the response model
        result = []
        for reg in registrations:
            result.append({
                "registration_id": reg["registration_id"],
                "student_id": reg["student_id"],
                "event_id": reg["event_id"],
                "status": reg["status"],
                "timestamp": reg["timestamp"],
                "student": {
                    "student_id": reg["student_id"],
                    "name": reg["student_name"],
                    "email": reg["student_email"],
                    "college_id": reg["student_college_id"]
                },
                "event": {
                    "event_id": reg["event_id"],
                    "name": reg["event_name"],
                    "type": reg["event_type"],
                    "date": reg["event_date"],
                    "capacity": reg["capacity"],
                    "description": reg["description"],
                    "college_id": reg["event_college_id"],
                    "created_by": reg["created_by"]
                }
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/event/{event_id}", response_model=List[RegistrationWithDetails])
async def get_event_registrations(event_id: int):
    """Get all students registered for an event"""
    try:
        # Check if event exists
        if not check_record_exists("Events", "event_id", event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        
        query = """
        SELECT r.*, s.name as student_name, s.email as student_email, s.college_id as student_college_id,
               e.name as event_name, e.type as event_type, e.date as event_date, e.capacity, e.description, e.college_id as event_college_id, e.created_by,
               c.name as college_name
        FROM Registrations r
        JOIN Students s ON r.student_id = s.student_id
        JOIN Events e ON r.event_id = e.event_id
        JOIN Colleges c ON s.college_id = c.College_id
        WHERE r.event_id = ?
        ORDER BY r.timestamp ASC
        """
        registrations = execute_query(query, (event_id,))
        
        # Transform the data to match the response model
        result = []
        for reg in registrations:
            result.append({
                "registration_id": reg["registration_id"],
                "student_id": reg["student_id"],
                "event_id": reg["event_id"],
                "status": reg["status"],
                "timestamp": reg["timestamp"],
                "student": {
                    "student_id": reg["student_id"],
                    "name": reg["student_name"],
                    "email": reg["student_email"],
                    "college_id": reg["student_college_id"]
                },
                "event": {
                    "event_id": reg["event_id"],
                    "name": reg["event_name"],
                    "type": reg["event_type"],
                    "date": reg["event_date"],
                    "capacity": reg["capacity"],
                    "description": reg["description"],
                    "college_id": reg["event_college_id"],
                    "created_by": reg["created_by"]
                }
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")