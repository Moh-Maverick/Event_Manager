from fastapi import APIRouter, HTTPException
from typing import List
from models import Attendance, AttendanceCreate, AttendanceWithDetails
from database import (
    execute_query, execute_insert, check_record_exists,
    get_attendance_count_for_event
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/", response_model=Attendance)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for a registration"""
    try:
        # Check if registration exists
        if not check_record_exists("Registrations", "registration_id", attendance.registration_id):
            raise HTTPException(status_code=400, detail="Registration not found")
        
        # Check if attendance already exists for this registration
        existing_attendance = execute_query(
            "SELECT attendance_id FROM Attendance WHERE registration_id = ?",
            (attendance.registration_id,)
        )
        if existing_attendance:
            raise HTTPException(status_code=400, detail="Attendance already marked for this registration")
        
        query = """
        INSERT INTO Attendance (registration_id, attended, timestamp)
        VALUES (?, ?, datetime('now'))
        """
        attendance_id = execute_insert(query, (attendance.registration_id, attendance.attended))
        
        # Return the created attendance record
        created_attendance = execute_query(
            "SELECT * FROM Attendance WHERE attendance_id = ?", (attendance_id,)
        )
        return created_attendance[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/event/{event_id}")
async def get_event_attendance_report(event_id: int):
    """Get attendance report for an event"""
    try:
        # Check if event exists
        if not check_record_exists("Events", "event_id", event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get event details
        event = execute_query("SELECT * FROM Events WHERE event_id = ?", (event_id,))
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get attendance details
        query = """
        SELECT a.*, r.student_id, s.name as student_name, s.email as student_email,
               r.status as registration_status, r.timestamp as registration_timestamp
        FROM Attendance a
        JOIN Registrations r ON a.registration_id = r.registration_id
        JOIN Students s ON r.student_id = s.student_id
        WHERE r.event_id = ?
        ORDER BY a.timestamp ASC
        """
        attendance_records = execute_query(query, (event_id,))
        
        # Get total registrations and attendance count
        total_registrations = execute_query(
            "SELECT COUNT(*) as count FROM Registrations WHERE event_id = ? AND status = 'Registered'",
            (event_id,)
        )[0]['count']
        
        total_attendance = get_attendance_count_for_event(event_id)
        attendance_rate = (total_attendance / total_registrations * 100) if total_registrations > 0 else 0
        
        return {
            "event": event[0],
            "summary": {
                "total_registrations": total_registrations,
                "total_attendance": total_attendance,
                "attendance_rate": round(attendance_rate, 2)
            },
            "attendance_records": attendance_records
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
