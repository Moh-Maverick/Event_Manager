from fastapi import APIRouter, HTTPException
from typing import List
from models import EventPopularityReport, StudentParticipationReport, TopStudentReport
from database import execute_query

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/event-popularity", response_model=List[EventPopularityReport])
async def get_event_popularity_report():
    """Get top events by number of registrations"""
    try:
        query = """
        SELECT e.event_id, e.name as event_name, c.name as college_name,
               COUNT(r.registration_id) as registration_count
        FROM Events e
        JOIN Colleges c ON e.college_id = c.College_id
        LEFT JOIN Registrations r ON e.event_id = r.event_id AND r.status = 'Registered'
        GROUP BY e.event_id, e.name, c.name
        ORDER BY registration_count DESC, e.name ASC
        """
        results = execute_query(query)
        
        return [
            EventPopularityReport(
                event_id=row['event_id'],
                event_name=row['event_name'],
                college_name=row['college_name'],
                registration_count=row['registration_count']
            )
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/student-participation", response_model=List[StudentParticipationReport])
async def get_student_participation_report():
    """Get number of events each student attended"""
    try:
        query = """
        SELECT s.student_id, s.name as student_name, c.name as college_name,
               COUNT(a.attendance_id) as events_attended
        FROM Students s
        JOIN Colleges c ON s.college_id = c.College_id
        LEFT JOIN Registrations r ON s.student_id = r.student_id
        LEFT JOIN Attendance a ON r.registration_id = a.registration_id AND a.attended = 1
        GROUP BY s.student_id, s.name, c.name
        ORDER BY events_attended DESC, s.name ASC
        """
        results = execute_query(query)
        
        return [
            StudentParticipationReport(
                student_id=row['student_id'],
                student_name=row['student_name'],
                college_name=row['college_name'],
                events_attended=row['events_attended']
            )
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/top-students", response_model=List[TopStudentReport])
async def get_top_students_report():
    """Get top 3 most active students"""
    try:
        query = """
        SELECT s.student_id, s.name as student_name, c.name as college_name,
               COUNT(DISTINCT r.event_id) as total_events,
               COUNT(a.attendance_id) as events_attended,
               CASE 
                   WHEN COUNT(DISTINCT r.event_id) > 0 
                   THEN ROUND(COUNT(a.attendance_id) * 100.0 / COUNT(DISTINCT r.event_id), 2)
                   ELSE 0 
               END as participation_rate
        FROM Students s
        JOIN Colleges c ON s.college_id = c.College_id
        LEFT JOIN Registrations r ON s.student_id = r.student_id AND r.status = 'Registered'
        LEFT JOIN Attendance a ON r.registration_id = a.registration_id AND a.attended = 1
        GROUP BY s.student_id, s.name, c.name
        HAVING total_events > 0
        ORDER BY events_attended DESC, participation_rate DESC, s.name ASC
        LIMIT 3
        """
        results = execute_query(query)
        
        return [
            TopStudentReport(
                student_id=row['student_id'],
                student_name=row['student_name'],
                college_name=row['college_name'],
                total_events=row['total_events'],
                events_attended=row['events_attended'],
                participation_rate=row['participation_rate']
            )
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
