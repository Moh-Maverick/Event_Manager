from fastapi import APIRouter, HTTPException
from typing import List
from models import Feedback, FeedbackCreate, FeedbackWithDetails
from database import execute_query, execute_insert, check_record_exists

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=Feedback)
async def submit_feedback(feedback: FeedbackCreate):
    """Submit feedback for an event (via registration_id)"""
    try:
        # Check if registration exists
        if not check_record_exists("Registrations", "registration_id", feedback.registration_id):
            raise HTTPException(status_code=400, detail="Registration not found")
        
        # Check if feedback already exists for this registration
        existing_feedback = execute_query(
            "SELECT feedback_id FROM Feedback WHERE registration_id = ?",
            (feedback.registration_id,)
        )
        if existing_feedback:
            raise HTTPException(status_code=400, detail="Feedback already submitted for this registration")
        
        # Validate rating
        if not (1 <= feedback.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        query = """
        INSERT INTO Feedback (registration_id, rating, comment)
        VALUES (?, ?, ?)
        """
        feedback_id = execute_insert(query, (
            feedback.registration_id, feedback.rating, feedback.comment
        ))
        
        # Return the created feedback
        created_feedback = execute_query(
            "SELECT * FROM Feedback WHERE feedback_id = ?", (feedback_id,)
        )
        return created_feedback[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/event/{event_id}", response_model=List[FeedbackWithDetails])
async def get_event_feedback(event_id: int):
    """Get all feedback for an event"""
    try:
        # Check if event exists
        if not check_record_exists("Events", "event_id", event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        
        query = """
        SELECT f.*, r.student_id, r.event_id, r.status as registration_status, r.timestamp as registration_timestamp,
               s.name as student_name, s.email as student_email, s.college_id as student_college_id,
               e.name as event_name, e.type as event_type, e.date as event_date, e.capacity, e.description, e.college_id as event_college_id, e.created_by,
               c.name as college_name
        FROM Feedback f
        JOIN Registrations r ON f.registration_id = r.registration_id
        JOIN Students s ON r.student_id = s.student_id
        JOIN Events e ON r.event_id = e.event_id
        JOIN Colleges c ON s.college_id = c.College_id
        WHERE r.event_id = ?
        ORDER BY f.feedback_id DESC
        """
        feedback_records = execute_query(query, (event_id,))
        
        # Transform the data to match the response model
        result = []
        for feedback in feedback_records:
            result.append({
                "feedback_id": feedback["feedback_id"],
                "registration_id": feedback["registration_id"],
                "rating": feedback["rating"],
                "comment": feedback["comment"],
                "registration": {
                    "registration_id": feedback["registration_id"],
                    "student_id": feedback["student_id"],
                    "event_id": feedback["event_id"],
                    "status": feedback["registration_status"],
                    "timestamp": feedback["registration_timestamp"],
                    "student": {
                        "student_id": feedback["student_id"],
                        "name": feedback["student_name"],
                        "email": feedback["student_email"],
                        "college_id": feedback["student_college_id"]
                    },
                    "event": {
                        "event_id": feedback["event_id"],
                        "name": feedback["event_name"],
                        "type": feedback["event_type"],
                        "date": feedback["event_date"],
                        "capacity": feedback["capacity"],
                        "description": feedback["description"],
                        "college_id": feedback["event_college_id"],
                        "created_by": feedback["created_by"]
                    }
                }
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")