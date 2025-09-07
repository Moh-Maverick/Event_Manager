import sqlite3
import os
from typing import List, Dict, Any, Optional
from contextlib import contextmanager


DATABASE_PATH = "campus_events.db"


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    try:
        yield conn
    finally:
        conn.close()


def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return results as list of dictionaries"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def execute_insert(query: str, params: tuple = ()) -> int:
    """Execute an INSERT query and return the last row ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return cursor.lastrowid


def execute_update(query: str, params: tuple = ()) -> int:
    """Execute an UPDATE/DELETE query and return number of affected rows"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return cursor.rowcount


def get_single_record(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """Execute a SELECT query and return a single record"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else None


def check_record_exists(table: str, column: str, value: Any) -> bool:
    """Check if a record exists in a table"""
    query = f"SELECT 1 FROM {table} WHERE {column} = ?"
    result = get_single_record(query, (value,))
    return result is not None


def get_college_by_id(college_id: int) -> Optional[Dict[str, Any]]:
    """Get college by ID"""
    return get_single_record(
        "SELECT * FROM Colleges WHERE College_id = ?", (college_id,)
    )


def get_student_by_id(student_id: int) -> Optional[Dict[str, Any]]:
    """Get student by ID"""
    return get_single_record(
        "SELECT * FROM Students WHERE student_id = ?", (student_id,)
    )


def get_event_by_id(event_id: int) -> Optional[Dict[str, Any]]:
    """Get event by ID"""
    return get_single_record(
        "SELECT * FROM Events WHERE event_id = ?", (event_id,)
    )


def get_registration_by_id(registration_id: int) -> Optional[Dict[str, Any]]:
    """Get registration by ID"""
    return get_single_record(
        "SELECT * FROM Registrations WHERE registration_id = ?", (registration_id,)
    )


def get_student_with_college(student_id: int) -> Optional[Dict[str, Any]]:
    """Get student with college information"""
    query = """
    SELECT s.*, c.name as college_name, c.location as college_location
    FROM Students s
    JOIN Colleges c ON s.college_id = c.College_id
    WHERE s.student_id = ?
    """
    return get_single_record(query, (student_id,))


def get_event_with_college(event_id: int) -> Optional[Dict[str, Any]]:
    """Get event with college information"""
    query = """
    SELECT e.*, c.name as college_name, c.location as college_location
    FROM Events e
    JOIN Colleges c ON e.college_id = c.College_id
    WHERE e.event_id = ?
    """
    return get_single_record(query, (event_id,))


def get_registration_with_details(registration_id: int) -> Optional[Dict[str, Any]]:
    """Get registration with student and event details"""
    query = """
    SELECT r.*, s.name as student_name, s.email as student_email,
           e.name as event_name, e.type as event_type, e.date as event_date,
           c.name as college_name
    FROM Registrations r
    JOIN Students s ON r.student_id = s.student_id
    JOIN Events e ON r.event_id = e.event_id
    JOIN Colleges c ON s.college_id = c.College_id
    WHERE r.registration_id = ?
    """
    return get_single_record(query, (registration_id,))


def get_attendance_count_for_event(event_id: int) -> int:
    """Get total attendance count for an event"""
    query = """
    SELECT COUNT(*) as count
    FROM Attendance a
    JOIN Registrations r ON a.registration_id = r.registration_id
    WHERE r.event_id = ? AND a.attended = 1
    """
    result = get_single_record(query, (event_id,))
    return result['count'] if result else 0


def get_registration_count_for_event(event_id: int) -> int:
    """Get total registration count for an event"""
    query = """
    SELECT COUNT(*) as count
    FROM Registrations
    WHERE event_id = ? AND status = 'Registered'
    """
    result = get_single_record(query, (event_id,))
    return result['count'] if result else 0
