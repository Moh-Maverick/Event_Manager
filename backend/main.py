from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import colleges, students, events, registrations, attendance, feedback, reports

# Create FastAPI application
app = FastAPI(
    title="Campus Events API",
    description="A comprehensive API for managing campus events, student registrations, attendance, and feedback",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(colleges.router)
app.include_router(students.router)
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(attendance.router)
app.include_router(feedback.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Campus Events API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "colleges": "/colleges",
            "students": "/students", 
            "events": "/events",
            "registrations": "/registrations",
            "attendance": "/attendance",
            "feedback": "/feedback",
            "reports": "/reports"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
