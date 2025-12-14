const API_URL = window.location.origin;

let editingEventId = null;

// DOM Elements
const newEventBtn = document.getElementById('new-event-btn');
const eventForm = document.getElementById('event-form');
const eventFormElement = document.getElementById('event-form-element');
const cancelEventBtn = document.getElementById('cancel-event-btn');
const eventsList = document.getElementById('events-list');
const formTitle = document.getElementById('form-title');

// Event Listeners
newEventBtn.addEventListener('click', showEventForm);
cancelEventBtn.addEventListener('click', hideEventForm);
eventFormElement.addEventListener('submit', handleEventSubmit);

// Initialize
loadEvents();

function showEventForm() {
    eventForm.style.display = 'block';
    formTitle.textContent = 'Create Event';
    editingEventId = null;
    eventFormElement.reset();
}

function hideEventForm() {
    eventForm.style.display = 'none';
    editingEventId = null;
    eventFormElement.reset();
}

async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/api/events`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            displayEvents(data.events);
        } else {
            eventsList.innerHTML = '<div class="empty-state"><p>No events found. Create your first event!</p></div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showMessage('Error loading events', 'error');
    }
}

function displayEvents(events) {
    eventsList.innerHTML = events.map(event => `
        <div class="data-card">
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
            <div class="card-actions">
                <button class="btn btn-primary" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value
    };

    try {
        let response;
        if (editingEventId) {
            response = await fetch(`${API_URL}/api/events/${editingEventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        } else {
            response = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        }

        if (response.ok) {
            showMessage(editingEventId ? 'Event updated successfully' : 'Event created successfully', 'success');
            hideEventForm();
            loadEvents();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error saving event', 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showMessage('Error saving event', 'error');
    }
}

async function editEvent(id) {
    try {
        const response = await fetch(`${API_URL}/api/events/${id}`);
        const data = await response.json();
        
        if (data.event) {
            document.getElementById('event-id').value = data.event.id;
            document.getElementById('event-name').value = data.event.name;
            document.getElementById('event-date').value = data.event.date;
            document.getElementById('event-location').value = data.event.location;
            document.getElementById('event-description').value = data.event.description || '';
            
            editingEventId = id;
            formTitle.textContent = 'Edit Event';
            eventForm.style.display = 'block';
            eventForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading event:', error);
        showMessage('Error loading event', 'error');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event? This will also delete all associated competitors and entries.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Event deleted successfully', 'success');
            loadEvents();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error deleting event', 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('Error deleting event', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
}
