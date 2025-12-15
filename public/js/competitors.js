const API_URL = window.location.origin;

let currentCompetitionId = null;
let currentEventId = null;
let editingCompetitorId = null;

// DOM Elements
const eventSelectGroup = document.getElementById('event-select-group');
const eventSelect = document.getElementById('event-select');
const competitorForm = document.getElementById('competitor-form');
const competitorFormElement = document.getElementById('competitor-form-element');
const newCompetitorBtn = document.getElementById('new-competitor-btn');
const cancelCompetitorBtn = document.getElementById('cancel-competitor-btn');
const competitorsContainer = document.getElementById('competitors-container');
const competitorsList = document.getElementById('competitors-list');
const formTitle = document.getElementById('form-title');
const competitionStatus = document.getElementById('competition-status');

// Event Listeners
eventSelect.addEventListener('change', handleEventChange);
newCompetitorBtn.addEventListener('click', showCompetitorForm);
cancelCompetitorBtn.addEventListener('click', hideCompetitorForm);
competitorFormElement.addEventListener('submit', handleCompetitorSubmit);

// Listen for global competition changes
window.addEventListener('competitionChanged', (event) => {
    const { id, name } = event.detail;
    handleCompetitionChange(id, name);
});

// Initialize - check if competition is already selected
document.addEventListener('DOMContentLoaded', () => {
    // Give competition-selector.js time to initialize
    setTimeout(() => {
        const comp = getGlobalCompetition();
        if (comp.id) {
            handleCompetitionChange(comp.id, comp.name);
        }
    }, 100);
});

async function handleCompetitionChange(competitionId, competitionName) {
    if (competitionId) {
        currentCompetitionId = competitionId;
        competitionStatus.textContent = `Viewing: ${competitionName}`;
        eventSelectGroup.style.display = 'block';
        competitorsContainer.style.display = 'none';
        competitorForm.style.display = 'none';
        await loadEvents(competitionId);
    } else {
        currentCompetitionId = null;
        competitionStatus.textContent = 'Please select a competition from the dropdown above.';
        eventSelectGroup.style.display = 'none';
        competitorsContainer.style.display = 'none';
        competitorForm.style.display = 'none';
    }
}

async function loadEvents(competitionId) {
    try {
        const response = await fetch(`${API_URL}/api/competitions/${competitionId}/events`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            eventSelect.innerHTML = '<option value="">-- Select an Event --</option>' +
                data.events.map(event => 
                    `<option value="${event.id}">${event.name}</option>`
                ).join('');
        } else {
            eventSelect.innerHTML = '<option value="">No events available</option>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showMessage('Error loading events', 'error');
    }
}

function handleEventChange() {
    const eventId = eventSelect.value;
    
    if (eventId) {
        currentEventId = eventId;
        competitorsContainer.style.display = 'block';
        competitorForm.style.display = 'none';
        loadCompetitors(eventId);
    } else {
        currentEventId = null;
        competitorsContainer.style.display = 'none';
        competitorForm.style.display = 'none';
    }
}

async function loadCompetitors(eventId) {
    try {
        const response = await fetch(`${API_URL}/api/events/${eventId}/competitors`);
        const data = await response.json();
        
        if (data.competitors && data.competitors.length > 0) {
            displayCompetitors(data.competitors);
        } else {
            competitorsList.innerHTML = '<div class="empty-state"><p>No competitors registered yet. Add your first competitor!</p></div>';
        }
    } catch (error) {
        console.error('Error loading competitors:', error);
        showMessage('Error loading competitors', 'error');
    }
}

function displayCompetitors(competitors) {
    competitorsList.innerHTML = competitors.map(competitor => `
        <div class="data-card">
            <h3>${competitor.first_name} ${competitor.last_name}</h3>
            ${competitor.club ? `<p><strong>Club:</strong> ${competitor.club}</p>` : ''}
            <div class="card-actions">
                <button class="btn btn-primary" onclick="editCompetitor(${competitor.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteCompetitor(${competitor.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showCompetitorForm() {
    competitorForm.style.display = 'block';
    formTitle.textContent = 'Add Competitor';
    editingCompetitorId = null;
    competitorFormElement.reset();
    competitorForm.scrollIntoView({ behavior: 'smooth' });
}

function hideCompetitorForm() {
    competitorForm.style.display = 'none';
    editingCompetitorId = null;
    competitorFormElement.reset();
}

async function handleCompetitorSubmit(e) {
    e.preventDefault();
    
    const competitorData = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        club: document.getElementById('club').value
    };

    try {
        let response;
        if (editingCompetitorId) {
            response = await fetch(`${API_URL}/api/competitors/${editingCompetitorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(competitorData)
            });
        } else {
            response = await fetch(`${API_URL}/api/events/${currentEventId}/competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(competitorData)
            });
        }

        if (response.ok) {
            showMessage(editingCompetitorId ? 'Competitor updated successfully' : 'Competitor added successfully', 'success');
            hideCompetitorForm();
            loadCompetitors(currentEventId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error saving competitor', 'error');
        }
    } catch (error) {
        console.error('Error saving competitor:', error);
        showMessage('Error saving competitor', 'error');
    }
}

async function editCompetitor(id) {
    try {
        const response = await fetch(`${API_URL}/api/competitors/${id}`);
        const data = await response.json();
        
        if (data.competitor) {
            document.getElementById('competitor-id').value = data.competitor.id;
            document.getElementById('first-name').value = data.competitor.first_name;
            document.getElementById('last-name').value = data.competitor.last_name;
            document.getElementById('club').value = data.competitor.club || '';
            
            editingCompetitorId = id;
            formTitle.textContent = 'Edit Competitor';
            competitorForm.style.display = 'block';
            competitorForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading competitor:', error);
        showMessage('Error loading competitor', 'error');
    }
}

async function deleteCompetitor(id) {
    if (!confirm('Are you sure you want to delete this competitor? This will also delete all their entries.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/competitors/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Competitor deleted successfully', 'success');
            loadCompetitors(currentEventId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error deleting competitor', 'error');
        }
    } catch (error) {
        console.error('Error deleting competitor:', error);
        showMessage('Error deleting competitor', 'error');
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
