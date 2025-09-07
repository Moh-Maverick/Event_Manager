// Global state
let currentData = {
    colleges: [],
    students: [],
    events: [],
    registrations: [],
    reports: {}
};

// Chart instances
let chartInstances = {
    eventPopularity: null,
    studentParticipation: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    try {
        APIUtils.showLoading();

        // Load initial data
        await loadDashboardData();
        await loadColleges();
        await loadStudents();
        await loadEvents();

        // Setup event listeners
        setupEventListeners();

        APIUtils.hideLoading();
        APIUtils.showToast('Application loaded successfully!');
    } catch (error) {
        APIUtils.hideLoading();
        APIUtils.handleError(error);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            showPage(page);
        });
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            showTab(tab);
        });
    });
}

// Navigation functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Load page-specific data
    switch (pageId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'colleges':
            loadColleges();
            break;
        case 'students':
            loadStudents();
            break;
        case 'events':
            loadEvents();
            break;
        case 'registrations':
            loadRegistrationsPage();
            break;
        case 'attendance':
            loadAttendancePage();
            break;
        case 'feedback':
            loadFeedbackPage();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const [colleges, students, events, eventPopularity, studentParticipation] = await Promise.all([
            api.getColleges(),
            api.getStudents(),
            api.getEvents(),
            api.getEventPopularityReport(),
            api.getStudentParticipationReport()
        ]);

        currentData.colleges = colleges;
        currentData.students = students;
        currentData.events = events;
        currentData.reports.eventPopularity = eventPopularity;
        currentData.reports.studentParticipation = studentParticipation;

        updateDashboardStats();
        updateCharts();
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function updateDashboardStats() {
    document.getElementById('total-colleges').textContent = currentData.colleges.length;
    document.getElementById('total-students').textContent = currentData.students.length;
    document.getElementById('total-events').textContent = currentData.events.length;

    // Calculate average rating (placeholder - would need feedback data)
    document.getElementById('avg-rating').textContent = '4.2';
}

function updateCharts() {
    destroyCharts();
    updateEventPopularityChart();
    updateStudentParticipationChart();
}

function destroyCharts() {
    // Destroy existing chart instances
    if (chartInstances.eventPopularity) {
        chartInstances.eventPopularity.destroy();
        chartInstances.eventPopularity = null;
    }
    if (chartInstances.studentParticipation) {
        chartInstances.studentParticipation.destroy();
        chartInstances.studentParticipation = null;
    }
}

function updateEventPopularityChart() {
    const ctx = document.getElementById('eventPopularityChart');
    if (!ctx) return;

    const data = currentData.reports.eventPopularity.slice(0, 5);

    chartInstances.eventPopularity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.event_name),
            datasets: [{
                label: 'Registrations',
                data: data.map(item => item.registration_count),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateStudentParticipationChart() {
    const ctx = document.getElementById('studentParticipationChart');
    if (!ctx) return;

    const data = currentData.reports.studentParticipation.slice(0, 5);

    chartInstances.studentParticipation = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.student_name),
            datasets: [{
                data: data.map(item => item.events_attended),
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(255, 193, 7, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Colleges functions
async function loadColleges() {
    try {
        const colleges = await api.getColleges();
        currentData.colleges = colleges;
        renderCollegesTable(colleges);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderCollegesTable(colleges) {
    const tbody = document.querySelector('#colleges-table tbody');
    if (!tbody) return;

    tbody.innerHTML = colleges.map(college => `
        <tr>
            <td>${college.college_id}</td>
            <td>${college.name}</td>
            <td>${college.location}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewCollege(${college.college_id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function viewCollege(collegeId) {
    const college = currentData.colleges.find(c => c.college_id === collegeId);
    if (college) {
        showModal('College Details', `
            <div class="college-details">
                <h4>${college.name}</h4>
                <p><strong>Location:</strong> ${college.location}</p>
                <p><strong>College ID:</strong> ${college.college_id}</p>
            </div>
        `);
    }
}

// Students functions
async function loadStudents() {
    try {
        const students = await api.getStudents();
        currentData.students = students;
        renderStudentsTable(students);
        updateStudentSelects();
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderStudentsTable(students) {
    const tbody = document.querySelector('#students-table tbody');
    if (!tbody) return;

    tbody.innerHTML = students.map(student => {
        const college = currentData.colleges.find(c => c.college_id === student.college_id);
        return `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${college ? college.name : 'Unknown'}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewStudent(${student.student_id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStudentSelects() {
    const selects = ['student-select', 'attendance-student-select', 'feedback-student-select'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Choose a student...</option>' +
                currentData.students.map(student =>
                    `<option value="${student.student_id}">${student.name} (${student.email})</option>`
                ).join('');
        }
    });
}

function searchStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const filteredStudents = currentData.students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );
    renderStudentsTable(filteredStudents);
}

function viewStudent(studentId) {
    const student = currentData.students.find(s => s.student_id === studentId);
    if (student) {
        const college = currentData.colleges.find(c => c.college_id === student.college_id);
        showModal('Student Details', `
            <div class="student-details">
                <h4>${student.name}</h4>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>College:</strong> ${college ? college.name : 'Unknown'}</p>
                <p><strong>Student ID:</strong> ${student.student_id}</p>
            </div>
        `);
    }
}

// Events functions
async function loadEvents() {
    try {
        const events = await api.getEvents();
        currentData.events = events;
        renderEventsTable(events);
        updateEventSelects();
        updateCollegeFilter();
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderEventsTable(events) {
    const tbody = document.querySelector('#events-table tbody');
    if (!tbody) return;

    tbody.innerHTML = events.map(event => {
        const college = currentData.colleges.find(c => c.college_id === event.college_id);
        return `
            <tr>
                <td>${event.event_id}</td>
                <td>${event.name}</td>
                <td>${event.type}</td>
                <td>${APIUtils.formatDate(event.date)}</td>
                <td>${event.capacity}</td>
                <td>${college ? college.name : 'Unknown'}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewEvent(${event.event_id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateEventSelects() {
    const selects = ['event-select', 'attendance-event-select', 'feedback-event-select'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Choose an event...</option>' +
                currentData.events.map(event =>
                    `<option value="${event.event_id}">${event.name} (${APIUtils.formatDate(event.date)})</option>`
                ).join('');
        }
    });
}

function updateCollegeFilter() {
    const filter = document.getElementById('college-filter');
    if (filter) {
        filter.innerHTML = '<option value="">All Colleges</option>' +
            currentData.colleges.map(college =>
                `<option value="${college.college_id}">${college.name}</option>`
            ).join('');
    }
}

function filterEvents() {
    const collegeId = document.getElementById('college-filter').value;
    if (collegeId) {
        const filteredEvents = currentData.events.filter(event => event.college_id == collegeId);
        renderEventsTable(filteredEvents);
    } else {
        renderEventsTable(currentData.events);
    }
}

function viewEvent(eventId) {
    const event = currentData.events.find(e => e.event_id === eventId);
    if (event) {
        const college = currentData.colleges.find(c => c.college_id === event.college_id);
        showModal('Event Details', `
            <div class="event-details">
                <h4>${event.name}</h4>
                <p><strong>Type:</strong> ${event.type}</p>
                <p><strong>Date:</strong> ${APIUtils.formatDate(event.date)}</p>
                <p><strong>Capacity:</strong> ${event.capacity}</p>
                <p><strong>College:</strong> ${college ? college.name : 'Unknown'}</p>
                <p><strong>Created by:</strong> ${event.created_by}</p>
                <p><strong>Description:</strong> ${event.description}</p>
            </div>
        `);
    }
}

// Registration functions
async function loadRegistrationsPage() {
    await loadStudents();
    await loadEvents();
}

async function loadStudentRegistrations() {
    const studentId = document.getElementById('student-select').value;
    if (!studentId) return;

    try {
        const registrations = await api.getStudentRegistrations(studentId);
        renderStudentRegistrationsTable(registrations);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderStudentRegistrationsTable(registrations) {
    const tbody = document.querySelector('#student-registrations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.event.name}</td>
            <td>${reg.event.type}</td>
            <td>${APIUtils.formatDate(reg.event.date)}</td>
            <td><span class="status ${reg.status.toLowerCase()}">${reg.status}</span></td>
            <td>${APIUtils.formatDate(reg.timestamp)}</td>
        </tr>
    `).join('');
}

async function loadEventRegistrations() {
    const eventId = document.getElementById('event-select').value;
    if (!eventId) return;

    try {
        const registrations = await api.getEventRegistrations(eventId);
        renderEventRegistrationsTable(registrations);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderEventRegistrationsTable(registrations) {
    const tbody = document.querySelector('#event-registrations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.student.name}</td>
            <td>${reg.student.email}</td>
            <td>${reg.student.college_name}</td>
            <td><span class="status ${reg.status.toLowerCase()}">${reg.status}</span></td>
            <td>${APIUtils.formatDate(reg.timestamp)}</td>
        </tr>
    `).join('');
}

// Attendance functions
async function loadAttendancePage() {
    await loadEvents();
}

async function loadAttendanceReport() {
    const eventId = document.getElementById('attendance-event-select').value;
    if (!eventId) return;

    try {
        const report = await api.getEventAttendance(eventId);
        updateAttendanceSummary(report.summary);
        renderAttendanceTable(report.attendance_records);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function updateAttendanceSummary(summary) {
    document.getElementById('total-registrations').textContent = summary.total_registrations;
    document.getElementById('total-attendance').textContent = summary.total_attendance;
    document.getElementById('attendance-rate').textContent = summary.attendance_rate + '%';
    document.getElementById('attendance-summary').style.display = 'grid';
}

function renderAttendanceTable(attendanceRecords) {
    const tbody = document.querySelector('#attendance-table tbody');
    if (!tbody) return;

    tbody.innerHTML = attendanceRecords.map(record => `
        <tr>
            <td>${record.student_name}</td>
            <td>${record.student_email}</td>
            <td><span class="status ${record.attended ? 'attended' : 'absent'}">${record.attended ? 'Present' : 'Absent'}</span></td>
            <td>${APIUtils.formatDate(record.timestamp)}</td>
        </tr>
    `).join('');
}

// Feedback functions
async function loadFeedbackPage() {
    await loadEvents();
}

async function loadEventFeedback() {
    const eventId = document.getElementById('feedback-event-select').value;
    if (!eventId) return;

    try {
        const feedbacks = await api.getEventFeedback(eventId);
        updateFeedbackSummary(feedbacks);
        renderFeedbackList(feedbacks);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function updateFeedbackSummary(feedbacks) {
    document.getElementById('total-feedback').textContent = feedbacks.length;
    const avgRating = APIUtils.calculateAverageRating(feedbacks);
    document.getElementById('avg-feedback-rating').textContent = avgRating;
    document.getElementById('feedback-summary').style.display = 'grid';
}

function renderFeedbackList(feedbacks) {
    const container = document.getElementById('feedback-list');
    if (!container) return;

    container.innerHTML = feedbacks.map(feedback => `
        <div class="feedback-item">
            <div class="feedback-header">
                <span class="feedback-student">${feedback.registration.student.name}</span>
                <div class="feedback-rating">
                    ${APIUtils.formatRating(feedback.rating)}
                </div>
            </div>
            <div class="feedback-comment">${feedback.comment || 'No comment provided'}</div>
        </div>
    `).join('');
}

// Reports functions
async function loadReports() {
    try {
        const [eventPopularity, studentParticipation, topStudents] = await Promise.all([
            api.getEventPopularityReport(),
            api.getStudentParticipationReport(),
            api.getTopStudentsReport()
        ]);

        renderEventPopularityTable(eventPopularity);
        renderStudentParticipationTable(studentParticipation);
        renderTopStudentsTable(topStudents);
    } catch (error) {
        APIUtils.handleError(error);
    }
}

function renderEventPopularityTable(data) {
    const tbody = document.querySelector('#event-popularity-table tbody');
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.event_name}</td>
            <td>${item.college_name}</td>
            <td>${item.registration_count}</td>
        </tr>
    `).join('');
}

function renderStudentParticipationTable(data) {
    const tbody = document.querySelector('#student-participation-table tbody');
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.student_name}</td>
            <td>${item.college_name}</td>
            <td>${item.events_attended}</td>
        </tr>
    `).join('');
}

function renderTopStudentsTable(data) {
    const tbody = document.querySelector('#top-students-table tbody');
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.student_name}</td>
            <td>${item.college_name}</td>
            <td>${item.total_events}</td>
            <td>${item.events_attended}</td>
            <td>${item.participation_rate}%</td>
        </tr>
    `).join('');
}

// Modal functions
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// Form functions
function showAddStudentModal() {
    const content = `
        <form id="add-student-form">
            <div class="form-group">
                <label for="student-name">Name *</label>
                <input type="text" id="student-name" required>
            </div>
            <div class="form-group">
                <label for="student-email">Email *</label>
                <input type="email" id="student-email" required>
            </div>
            <div class="form-group">
                <label for="student-college">College *</label>
                <select id="student-college" required>
                    <option value="">Choose a college...</option>
                    ${currentData.colleges.map(college =>
        `<option value="${college.college_id}">${college.name}</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Student</button>
            </div>
        </form>
    `;

    showModal('Add New Student', content);

    document.getElementById('add-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addStudent();
    });
}

async function addStudent() {
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('student-email').value;
    const collegeId = document.getElementById('student-college').value;

    const missing = APIUtils.validateRequired({ name, email, collegeId }, ['name', 'email', 'collegeId']);
    if (missing.length > 0) {
        APIUtils.showToast(`Please fill in: ${missing.join(', ')}`, 'error');
        return;
    }

    if (!APIUtils.isValidEmail(email)) {
        APIUtils.showToast('Please enter a valid email address', 'error');
        return;
    }

    try {
        APIUtils.showLoading();
        await api.createStudent({ name, email, college_id: parseInt(collegeId) });
        closeModal();
        await loadStudents();
        APIUtils.showToast('Student added successfully!');
    } catch (error) {
        APIUtils.handleError(error);
    } finally {
        APIUtils.hideLoading();
    }
}

function showAddEventModal() {
    const content = `
        <form id="add-event-form">
            <div class="form-group">
                <label for="event-name">Event Name *</label>
                <input type="text" id="event-name" required>
            </div>
            <div class="form-group">
                <label for="event-type">Event Type *</label>
                <input type="text" id="event-type" required>
            </div>
            <div class="form-group">
                <label for="event-date">Date *</label>
                <input type="datetime-local" id="event-date" required>
            </div>
            <div class="form-group">
                <label for="event-capacity">Capacity *</label>
                <input type="number" id="event-capacity" min="1" required>
            </div>
            <div class="form-group">
                <label for="event-description">Description</label>
                <textarea id="event-description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="event-college">College *</label>
                <select id="event-college" required>
                    <option value="">Choose a college...</option>
                    ${currentData.colleges.map(college =>
        `<option value="${college.college_id}">${college.name}</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="event-created-by">Created By *</label>
                <input type="text" id="event-created-by" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Event</button>
            </div>
        </form>
    `;

    showModal('Add New Event', content);

    document.getElementById('add-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addEvent();
    });
}

async function addEvent() {
    const name = document.getElementById('event-name').value;
    const type = document.getElementById('event-type').value;
    const date = document.getElementById('event-date').value;
    const capacity = document.getElementById('event-capacity').value;
    const description = document.getElementById('event-description').value;
    const collegeId = document.getElementById('event-college').value;
    const createdBy = document.getElementById('event-created-by').value;

    const missing = APIUtils.validateRequired({ name, type, date, capacity, collegeId, createdBy },
        ['name', 'type', 'date', 'capacity', 'collegeId', 'createdBy']);
    if (missing.length > 0) {
        APIUtils.showToast(`Please fill in: ${missing.join(', ')}`, 'error');
        return;
    }

    try {
        APIUtils.showLoading();
        await api.createEvent({
            name, type, date,
            capacity: parseInt(capacity),
            description,
            college_id: parseInt(collegeId),
            created_by: createdBy
        });
        closeModal();
        await loadEvents();
        APIUtils.showToast('Event added successfully!');
    } catch (error) {
        APIUtils.handleError(error);
    } finally {
        APIUtils.hideLoading();
    }
}

function showAddRegistrationModal() {
    const content = `
        <form id="add-registration-form">
            <div class="form-group">
                <label for="reg-student">Student *</label>
                <select id="reg-student" required>
                    <option value="">Choose a student...</option>
                    ${currentData.students.map(student =>
        `<option value="${student.student_id}">${student.name} (${student.email})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="reg-event">Event *</label>
                <select id="reg-event" required>
                    <option value="">Choose an event...</option>
                    ${currentData.events.map(event =>
        `<option value="${event.event_id}">${event.name} (${APIUtils.formatDate(event.date)})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Register</button>
            </div>
        </form>
    `;

    showModal('Register Student for Event', content);

    document.getElementById('add-registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addRegistration();
    });
}

async function addRegistration() {
    const studentId = document.getElementById('reg-student').value;
    const eventId = document.getElementById('reg-event').value;

    if (!studentId || !eventId) {
        APIUtils.showToast('Please select both student and event', 'error');
        return;
    }

    try {
        APIUtils.showLoading();
        await api.createRegistration({
            student_id: parseInt(studentId),
            event_id: parseInt(eventId)
        });
        closeModal();
        APIUtils.showToast('Registration successful!');
    } catch (error) {
        APIUtils.handleError(error);
    } finally {
        APIUtils.hideLoading();
    }
}

function showMarkAttendanceModal() {
    const content = `
        <form id="mark-attendance-form">
            <div class="form-group">
                <label for="att-student">Student *</label>
                <select id="att-student" required>
                    <option value="">Choose a student...</option>
                    ${currentData.students.map(student =>
        `<option value="${student.student_id}">${student.name} (${student.email})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="att-event">Event *</label>
                <select id="att-event" required>
                    <option value="">Choose an event...</option>
                    ${currentData.events.map(event =>
        `<option value="${event.event_id}">${event.name} (${APIUtils.formatDate(event.date)})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="att-status">Attendance Status *</label>
                <select id="att-status" required>
                    <option value="">Choose status...</option>
                    <option value="1">Present</option>
                    <option value="0">Absent</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Mark Attendance</button>
            </div>
        </form>
    `;

    showModal('Mark Attendance', content);

    document.getElementById('mark-attendance-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await markAttendance();
    });
}

async function markAttendance() {
    const studentId = document.getElementById('att-student').value;
    const eventId = document.getElementById('att-event').value;
    const attended = document.getElementById('att-status').value;

    if (!studentId || !eventId || attended === '') {
        APIUtils.showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        // First get the registration ID
        const registrations = await api.getEventRegistrations(eventId);
        const registration = registrations.find(r => r.student_id == studentId);

        if (!registration) {
            APIUtils.showToast('Student is not registered for this event', 'error');
            return;
        }

        APIUtils.showLoading();
        await api.markAttendance({
            registration_id: registration.registration_id,
            attended: parseInt(attended)
        });
        closeModal();
        APIUtils.showToast('Attendance marked successfully!');
    } catch (error) {
        APIUtils.handleError(error);
    } finally {
        APIUtils.hideLoading();
    }
}

function showSubmitFeedbackModal() {
    const content = `
        <form id="submit-feedback-form">
            <div class="form-group">
                <label for="fb-student">Student *</label>
                <select id="fb-student" required>
                    <option value="">Choose a student...</option>
                    ${currentData.students.map(student =>
        `<option value="${student.student_id}">${student.name} (${student.email})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="fb-event">Event *</label>
                <select id="fb-event" required>
                    <option value="">Choose an event...</option>
                    ${currentData.events.map(event =>
        `<option value="${event.event_id}">${event.name} (${APIUtils.formatDate(event.date)})</option>`
    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="fb-rating">Rating *</label>
                <select id="fb-rating" required>
                    <option value="">Choose rating...</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                </select>
            </div>
            <div class="form-group">
                <label for="fb-comment">Comment</label>
                <textarea id="fb-comment" rows="3" placeholder="Share your feedback about the event..."></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Feedback</button>
            </div>
        </form>
    `;

    showModal('Submit Feedback', content);

    document.getElementById('submit-feedback-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitFeedback();
    });
}

async function submitFeedback() {
    const studentId = document.getElementById('fb-student').value;
    const eventId = document.getElementById('fb-event').value;
    const rating = document.getElementById('fb-rating').value;
    const comment = document.getElementById('fb-comment').value;

    if (!studentId || !eventId || !rating) {
        APIUtils.showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        // First get the registration ID
        const registrations = await api.getEventRegistrations(eventId);
        const registration = registrations.find(r => r.student_id == studentId);

        if (!registration) {
            APIUtils.showToast('Student is not registered for this event', 'error');
            return;
        }

        APIUtils.showLoading();
        await api.submitFeedback({
            registration_id: registration.registration_id,
            rating: parseInt(rating),
            comment: comment || null
        });
        closeModal();
        APIUtils.showToast('Feedback submitted successfully!');
    } catch (error) {
        APIUtils.handleError(error);
    } finally {
        APIUtils.hideLoading();
    }
}
