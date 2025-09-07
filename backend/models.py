from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# College Models
class CollegeBase(BaseModel):
    name: str
    location: str


class CollegeCreate(CollegeBase):
    pass


class College(CollegeBase):
    college_id: int

    class Config:
        from_attributes = True


# Student Models
class StudentBase(BaseModel):
    name: str
    email: str
    college_id: int


class StudentCreate(StudentBase):
    pass


class Student(StudentBase):
    student_id: int

    class Config:
        from_attributes = True


# Event Models
class EventBase(BaseModel):
    name: str
    type: str
    date: str
    capacity: int
    description: str
    college_id: int
    created_by: str


class EventCreate(EventBase):
    pass


class Event(EventBase):
    event_id: int

    class Config:
        from_attributes = True


# Registration Models
class RegistrationBase(BaseModel):
    student_id: int
    event_id: int
    status: str = "Registered"


class RegistrationCreate(RegistrationBase):
    pass


class Registration(RegistrationBase):
    registration_id: int
    timestamp: str

    class Config:
        from_attributes = True


# Attendance Models
class AttendanceBase(BaseModel):
    registration_id: int
    attended: int  # 1 for True, 0 for False


class AttendanceCreate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    attendance_id: int
    timestamp: str

    class Config:
        from_attributes = True


# Feedback Models
class FeedbackBase(BaseModel):
    registration_id: int
    rating: int  # 1-5
    comment: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    pass


class Feedback(FeedbackBase):
    feedback_id: int

    class Config:
        from_attributes = True


# Response Models for Reports
class EventPopularityReport(BaseModel):
    event_id: int
    event_name: str
    college_name: str
    registration_count: int


class StudentParticipationReport(BaseModel):
    student_id: int
    student_name: str
    college_name: str
    events_attended: int


class TopStudentReport(BaseModel):
    student_id: int
    student_name: str
    college_name: str
    total_events: int
    events_attended: int
    participation_rate: float


# Extended Models for detailed responses
class StudentWithCollege(Student):
    college: College


class EventWithCollege(Event):
    college: College


class RegistrationWithDetails(Registration):
    student: Student
    event: Event


class AttendanceWithDetails(Attendance):
    registration: RegistrationWithDetails


class FeedbackWithDetails(Feedback):
    registration: RegistrationWithDetails
