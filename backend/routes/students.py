from fastapi import APIRouter, HTTPException
from typing import List
from models import Student, StudentCreate, StudentWithCollege
from database import (
    execute_query, execute_insert, get_student_by_id, 
    get_student_with_college, check_record_exists
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/", response_model=List[Student])
async def get_students():
    """Get all students"""
    try:
        query = "SELECT student_id, name, email, college_id FROM Students"
        students = execute_query(query)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{student_id}", response_model=Student)
async def get_student(student_id: int):
    """Get a specific student by ID"""
    try:
        student = get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/", response_model=Student)
async def create_student(student: StudentCreate):
    """Register a new student"""
    try:
        # Check if college exists
        if not check_record_exists("Colleges", "College_id", student.college_id):
            raise HTTPException(status_code=400, detail="College not found")
        
        # Check if email already exists
        if check_record_exists("Students", "email", student.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        query = """
        INSERT INTO Students (name, email, college_id)
        VALUES (?, ?, ?)
        """
        student_id = execute_insert(query, (student.name, student.email, student.college_id))
        
        # Return the created student
        created_student = get_student_by_id(student_id)
        return created_student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
