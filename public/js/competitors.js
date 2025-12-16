const API_URL = window.location.origin;

let currentEventId = null;
let eventName = '';
let editingCompetitorId = null;

// DOM Elements
const competitorForm = document.getElementById('competitor-form');
const competitorFormElement = document.getElementById('competitor-form-element');
const newCompetitorBtn = document.getElementById('new-competitor-btn');
const cancelCompetitorBtn = document.getElementById('cancel-competitor-btn');
const competitorsList = document.getElementById('competitors-list');
const formTitle = document.getElementById('form-title');
const eventTitle = document.getElementById('event-title');
const backLink = document.getElementById('back-to-competitions');

// Event Listeners
newCompetitorBtn.addEventListener('click', showCompetitorForm);
cancelCompetitorBtn.addEventListener('click', hideCompetitorForm);
competitorFormElement.addEventListener('submit', handleCompetitorSubmit);

// Initialize - get eventId from URL
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (!eventId) {
        competitorsList.innerHTML = '<div class="empty-state"><p>No event selected. Please select an event from the events page.</p></div>';
        newCompetitorBtn.style.display = 'none';
        return;
    }
    
    currentEventId = eventId;
    
    // Load event details to get name and competition
    try {
        const response = await fetch(`${API_URL}/api/events/${eventId}`);
        const data = await response.json();
        if (data.event) {
            eventName = data.event.name;
            eventTitle.textContent = `Competitors - ${eventName}`;
            backLink.href = `/events.html?competitionId=${data.event.competition_id}`;
        }
    } catch (error) {
        console.error('Error loading event details:', error);
    }
    
    loadCompetitors(eventId);
});

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
