# Campus Event Management Reporting System

## Done By
**Mohit R** - REVA University

Purpose -  Assignment given by Webknot Technology 

## Project Summary

This project is a prototype for a reporting system for a Campus Event Management System. The goal was to create a working prototype that can generate report on student event participation, student attendance and feedback.These reports are generated to know the information about the popularity of an event and how students responds to those.

The project shows how event data can be stored, retrieved and analyzed in useful manner. I have used a dummy data that looks like a live data to simulate on what might happen if this was a fully produced application. And also i have created a simple frontend to show how the APIs function and can utilized for this purpose

## My Approach 

I used Chatgpt to brainstorm ideas for this project. It Suggested a few Database Design but in the end with reference to ones suggested i was able make my own db design. Using the design i was able to analyse the necessary APIs required for the project With help of cursor i was able to make the APIs and dummy database.

The frotnend was solely created just for people to visualize the working of the APIs. I also had to consider various edge cases which might affect the workflow

This prototype project demonstrates how a simple system can be helpful given insights on students particiaption and events conducted 

## Features 

### Event Tracking
- Every event is created by the admins tracks the event details like type, name, date, capacity and description 

### Student Registration
- Students can register for any events.
- Each registration is linked to a student and an event.
- Duplicate registrations for events are not accepted.

### Attendance Tracking
- For each event's registrations, attendance can be tracked.
- Attendace marking is allowed only if a particular student has registered for an event.

### Feedback System
- After attending an event , students are able to give rating and comments for the event
- It also analyses the event quality and engagement 

### Reports Generated
- These Reports can be used to see how the engagement of students are with the partciaption of events 
- Shows Events with most Registrations
- Number of students participating in a event 
- Shows the most active students across all colleges

## Database Design 
- Colleges – College_id, name, location. 
- Students – Student_id, name, email, college_id. 
- Events – Event_id, name, type, date, capacity, description, college_id, created_by. 
- Registrations – Registration_id, student_id, event_id, status, timestamp. 
- Attendance – Registration_id, attended (boolean), timestamp. 
- Feedback – Registration_id, rating (1–5), comment.

## API Endpoints 
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /students` - List all students
- `POST /students` - Register new student
- `POST /registrations` - Register student for event
- `POST /attendance` - Mark attendance
- `POST /feedback` - Submit feedback
- `GET /reports/event-popularity` - Event popularity report
- `GET /reports/student-participation` - Student participation report
- `GET /reports/top-students` - Top students report

## How to Run 

### Using Hosted URL 
`https://www.demo.netlify.com`

### (OR) Running on your Systems( recommended for developers)
#### Backend
1. Go to the backend file
   ```bash
   cd backend
   ```
2. Install required dependencies
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server
   ```bash
   uvicorn main:app --reload
   ```
- The Backend Server runs on the url `http://localhost:8000`

#### Frontend 
1. Go to the frontend directory:
   ```bash
   cd frontend
   ```
2. Open `index.html` in your web browser (make sure the backend server is running)

## Technologies Used

- **Backend**: Python, FastAPI
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite
- **API Documentation**: Swagger UI (FastAPI automatic)