const API_URL = window.location.origin;

let editingCompetitionId = null;
let currentUserRole = 'viewer'; // Default to viewer

// DOM Elements
const newCompetitionBtn = document.getElementById('new-competition-btn');
const competitionForm = document.getElementById('competition-form');
const competitionFormElement = document.getElementById('competition-form-element');
const cancelCompetitionBtn = document.getElementById('cancel-competition-btn');
const competitionsList = document.getElementById('competitions-list');
const formTitle = document.getElementById('form-title');

// Event Listeners
newCompetitionBtn.addEventListener('click', showCompetitionForm);
cancelCompetitionBtn.addEventListener('click', hideCompetitionForm);
competitionFormElement.addEventListener('submit', handleCompetitionSubmit);

// Listen for user role and hide button for viewers
window.addEventListener('userLoaded', (event) => {
    const user = event.detail;
    currentUserRole = user.role;
    if (user.role === 'viewer') {
        newCompetitionBtn.style.display = 'none';
    }
    // Reload competitions to update action buttons
    loadCompetitions();
});

// Initialize
loadCompetitions();

function showCompetitionForm() {
    competitionForm.style.display = 'block';
    formTitle.textContent = 'Create Competition';
    editingCompetitionId = null;
    competitionFormElement.reset();
}

function hideCompetitionForm() {
    competitionForm.style.display = 'none';
    editingCompetitionId = null;
    competitionFormElement.reset();
}

async function loadCompetitions() {
    try {
        const response = await fetch(`${API_URL}/api/competitions`);
        const data = await response.json();
        
        if (data.competitions && data.competitions.length > 0) {
            displayCompetitions(data.competitions);
        } else {
            competitionsList.innerHTML = '<div class="empty-state"><p>No competitions found. Create your first competition!</p></div>';
        }
    } catch (error) {
        console.error('Error loading competitions:', error);
        showMessage('Error loading competitions', 'error');
    }
}

function displayCompetitions(competitions) {
    competitionsList.innerHTML = competitions.map(competition => {
        // Show action buttons based on role
        const showManageEvents = currentUserRole !== 'viewer';
        const showEditDelete = currentUserRole === 'admin' || currentUserRole === 'manager';
        
        return `
            <div class="data-card">
                <h3>${competition.name}</h3>
                <p><strong>Date:</strong> ${new Date(competition.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${competition.location}</p>
                ${competition.description ? `<p><strong>Description:</strong> ${competition.description}</p>` : ''}
                <p><strong>Judges:</strong> ${competition.num_judges || 5}</p>
                <div class="card-actions">
                    ${showManageEvents ? `<button class="btn btn-secondary" onclick="manageEvents(${competition.id}, '${competition.name.replace(/'/g, "\\'")}')">Manage Events</button>` : ''}
                    ${showEditDelete ? `<button class="btn btn-primary" onclick="editCompetition(${competition.id})">Edit</button>` : ''}
                    ${showEditDelete ? `<button class="btn btn-danger" onclick="deleteCompetition(${competition.id})">Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function handleCompetitionSubmit(e) {
    e.preventDefault();
    
    const competitionData = {
        name: document.getElementById('competition-name').value,
        date: document.getElementById('competition-date').value,
        location: document.getElementById('competition-location').value,
        description: document.getElementById('competition-description').value,
        num_judges: parseInt(document.getElementById('num-judges').value)
    };

    try {
        let response;
        if (editingCompetitionId) {
            response = await fetch(`${API_URL}/api/competitions/${editingCompetitionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(competitionData)
            });
        } else {
            response = await fetch(`${API_URL}/api/competitions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(competitionData)
            });
        }

        if (response.ok) {
            showMessage(editingCompetitionId ? 'Competition updated successfully' : 'Competition created successfully', 'success');
            hideCompetitionForm();
            loadCompetitions();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error saving competition', 'error');
        }
    } catch (error) {
        console.error('Error saving competition:', error);
        showMessage('Error saving competition', 'error');
    }
}

async function editCompetition(id) {
    try {
        const response = await fetch(`${API_URL}/api/competitions/${id}`);
        const data = await response.json();
        
        if (data.competition) {
            document.getElementById('competition-id').value = data.competition.id;
            document.getElementById('competition-name').value = data.competition.name;
            document.getElementById('competition-date').value = data.competition.date;
            document.getElementById('competition-location').value = data.competition.location;
            document.getElementById('competition-description').value = data.competition.description || '';
            document.getElementById('num-judges').value = data.competition.num_judges || 5;
            
            editingCompetitionId = id;
            formTitle.textContent = 'Edit Competition';
            competitionForm.style.display = 'block';
            competitionForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading competition:', error);
        showMessage('Error loading competition', 'error');
    }
}

async function deleteCompetition(id) {
    if (!confirm('Are you sure you want to delete this competition? This will also delete all events, competitors, and dive sheets associated with it.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/competitions/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Competition deleted successfully', 'success');
            loadCompetitions();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error deleting competition', 'error');
        }
    } catch (error) {
        console.error('Error deleting competition:', error);
        showMessage('Error deleting competition', 'error');
    }
}

function manageEvents(competitionId, competitionName) {
    // Store in sessionStorage and redirect to events page
    sessionStorage.setItem('selectedCompetitionId', competitionId);
    sessionStorage.setItem('selectedCompetitionName', competitionName);
    window.location.href = '/events.html';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
}
