// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Service Class
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Health Check
    async healthCheck() {
        return this.get('/health');
    }

    // Colleges API
    async getColleges() {
        return this.get('/colleges');
    }

    async getCollege(id) {
        return this.get(`/colleges/${id}`);
    }

    // Students API
    async getStudents() {
        return this.get('/students');
    }

    async getStudent(id) {
        return this.get(`/students/${id}`);
    }

    async createStudent(studentData) {
        return this.post('/students', studentData);
    }

    // Events API
    async getEvents(collegeId = null) {
        const endpoint = collegeId ? `/events?college_id=${collegeId}` : '/events';
        return this.get(endpoint);
    }

    async getEvent(id) {
        return this.get(`/events/${id}`);
    }

    async createEvent(eventData) {
        return this.post('/events', eventData);
    }

    // Registrations API
    async createRegistration(registrationData) {
        return this.post('/registrations', registrationData);
    }

    async getStudentRegistrations(studentId) {
        return this.get(`/registrations/student/${studentId}`);
    }

    async getEventRegistrations(eventId) {
        return this.get(`/registrations/event/${eventId}`);
    }

    // Attendance API
    async markAttendance(attendanceData) {
        return this.post('/attendance', attendanceData);
    }

    async getEventAttendance(eventId) {
        return this.get(`/attendance/event/${eventId}`);
    }

    // Feedback API
    async submitFeedback(feedbackData) {
        return this.post('/feedback', feedbackData);
    }

    async getEventFeedback(eventId) {
        return this.get(`/feedback/event/${eventId}`);
    }

    // Reports API
    async getEventPopularityReport() {
        return this.get('/reports/event-popularity');
    }

    async getStudentParticipationReport() {
        return this.get('/reports/student-participation');
    }

    async getTopStudentsReport() {
        return this.get('/reports/top-students');
    }
}

// Create global API instance
const api = new APIService();

// Utility functions for common operations
const APIUtils = {
    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format rating stars
    formatRating(rating) {
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return stars;
    },

    // Calculate average rating
    calculateAverageRating(feedbacks) {
        if (!feedbacks || feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        return (sum / feedbacks.length).toFixed(1);
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show loading state
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('active');
    },

    // Hide loading state
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.remove('active');
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    },

    // Handle API errors
    handleError(error) {
        console.error('API Error:', error);
        const message = error.message || 'An unexpected error occurred';
        this.showToast(message, 'error');
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate required fields
    validateRequired(data, requiredFields) {
        const missing = [];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                missing.push(field);
            }
        });
        return missing;
    }
};

// Export for use in other files
window.api = api;
window.APIUtils = APIUtils;
