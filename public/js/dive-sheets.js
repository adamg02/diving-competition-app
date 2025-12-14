const API_URL = window.location.origin;

let currentEventId = null;
let currentCompetitorId = null;
let editingEntryId = null;
let currentSheetStatus = 'draft';

// DOM Elements
const eventSelect = document.getElementById('event-select');
const competitorSelectGroup = document.getElementById('competitor-select-group');
const competitorSelect = document.getElementById('competitor-select');
const diveSheetContainer = document.getElementById('dive-sheet-container');
const entryForm = document.getElementById('entry-form');
const entryFormElement = document.getElementById('entry-form-element');
const newEntryBtn = document.getElementById('new-entry-btn');
const cancelEntryBtn = document.getElementById('cancel-entry-btn');
const entriesList = document.getElementById('entries-list');
const formTitle = document.getElementById('form-title');
const sheetStatus = document.getElementById('sheet-status');
const submitSheetBtn = document.getElementById('submit-sheet-btn');
const reopenSheetBtn = document.getElementById('reopen-sheet-btn');

// Event Listeners
eventSelect.addEventListener('change', handleEventChange);
competitorSelect.addEventListener('change', handleCompetitorChange);
newEntryBtn.addEventListener('click', showEntryForm);
cancelEntryBtn.addEventListener('click', hideEntryForm);
entryFormElement.addEventListener('submit', handleEntrySubmit);
submitSheetBtn.addEventListener('click', submitDiveSheet);
reopenSheetBtn.addEventListener('click', reopenDiveSheet);

// Initialize
loadEvents();

async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/api/events`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            eventSelect.innerHTML = '<option value="">-- Select an Event --</option>' +
                data.events.map(event => 
                    `<option value="${event.id}">${event.name} - ${new Date(event.date).toLocaleDateString()}</option>`
                ).join('');
        } else {
            eventSelect.innerHTML = '<option value="">No events available</option>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showMessage('Error loading events', 'error');
    }
}

async function handleEventChange() {
    const eventId = eventSelect.value;
    
    if (eventId) {
        currentEventId = eventId;
        competitorSelectGroup.style.display = 'block';
        diveSheetContainer.style.display = 'none';
        await loadCompetitors(eventId);
    } else {
        currentEventId = null;
        competitorSelectGroup.style.display = 'none';
        diveSheetContainer.style.display = 'none';
    }
}

async function loadCompetitors(eventId) {
    try {
        const response = await fetch(`${API_URL}/api/events/${eventId}/competitors`);
        const data = await response.json();
        
        if (data.competitors && data.competitors.length > 0) {
            competitorSelect.innerHTML = '<option value="">-- Select a Competitor --</option>' +
                data.competitors.map(competitor => 
                    `<option value="${competitor.id}">${competitor.first_name} ${competitor.last_name}</option>`
                ).join('');
        } else {
            competitorSelect.innerHTML = '<option value="">No competitors available</option>';
        }
    } catch (error) {
        console.error('Error loading competitors:', error);
        showMessage('Error loading competitors', 'error');
    }
}

async function handleCompetitorChange() {
    const competitorId = competitorSelect.value;
    
    if (competitorId) {
        currentCompetitorId = competitorId;
        diveSheetContainer.style.display = 'block';
        entryForm.style.display = 'none';
        await loadDiveSheet(competitorId);
    } else {
        currentCompetitorId = null;
        diveSheetContainer.style.display = 'none';
    }
}

async function loadDiveSheet(competitorId) {
    try {
        const response = await fetch(`${API_URL}/api/competitors/${competitorId}/dive-sheet`);
        const data = await response.json();
        
        // Update status
        if (data.dive_sheet && data.dive_sheet.status) {
            currentSheetStatus = data.dive_sheet.status;
            sheetStatus.textContent = currentSheetStatus.charAt(0).toUpperCase() + currentSheetStatus.slice(1);
            
            if (currentSheetStatus === 'submitted') {
                sheetStatus.className = 'submitted';
                submitSheetBtn.style.display = 'none';
                reopenSheetBtn.style.display = 'inline-block';
                newEntryBtn.disabled = true;
                entryForm.style.display = 'none';
            } else {
                sheetStatus.className = '';
                submitSheetBtn.style.display = 'inline-block';
                reopenSheetBtn.style.display = 'none';
                newEntryBtn.disabled = false;
            }
        }
        
        // Display entries
        if (data.entries && data.entries.length > 0) {
            displayEntries(data.entries);
        } else {
            entriesList.innerHTML = '<div class="empty-state"><p>No dive entries yet. Add your first dive!</p></div>';
        }
    } catch (error) {
        console.error('Error loading dive sheet:', error);
        showMessage('Error loading dive sheet', 'error');
    }
}

function displayEntries(entries) {
    const isSubmitted = currentSheetStatus === 'submitted';
    
    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="entry-number">${entry.dive_number}</div>
            <div class="entry-details">
                <h4>FINA Code: ${entry.fina_code}</h4>
                <p><strong>Difficulty:</strong> ${entry.difficulty}</p>
                ${entry.description ? `<p><strong>Description:</strong> ${entry.description}</p>` : ''}
            </div>
            <div class="entry-actions">
                <button class="btn btn-primary" onclick="editEntry(${entry.id})" ${isSubmitted ? 'disabled' : ''}>Edit</button>
                <button class="btn btn-danger" onclick="deleteEntry(${entry.id})" ${isSubmitted ? 'disabled' : ''}>Delete</button>
            </div>
        </div>
    `).join('');
}

function showEntryForm() {
    entryForm.style.display = 'block';
    formTitle.textContent = 'Add Dive Entry';
    editingEntryId = null;
    entryFormElement.reset();
    entryForm.scrollIntoView({ behavior: 'smooth' });
}

function hideEntryForm() {
    entryForm.style.display = 'none';
    editingEntryId = null;
    entryFormElement.reset();
}

async function handleEntrySubmit(e) {
    e.preventDefault();
    
    const entryData = {
        dive_number: parseInt(document.getElementById('dive-number').value),
        fina_code: document.getElementById('fina-code').value.trim().toUpperCase(),
        difficulty: parseFloat(document.getElementById('difficulty').value),
        description: document.getElementById('description').value
    };

    try {
        let response;
        if (editingEntryId) {
            response = await fetch(`${API_URL}/api/entries/${editingEntryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });
        } else {
            response = await fetch(`${API_URL}/api/competitors/${currentCompetitorId}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });
        }

        if (response.ok) {
            showMessage(editingEntryId ? 'Entry updated successfully' : 'Entry added successfully', 'success');
            hideEntryForm();
            loadDiveSheet(currentCompetitorId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error saving entry', 'error');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        showMessage('Error saving entry', 'error');
    }
}

async function editEntry(id) {
    if (currentSheetStatus === 'submitted') {
        showMessage('Cannot edit entries in a submitted dive sheet', 'error');
        return;
    }

    try {
        // Find entry in the current list
        const response = await fetch(`${API_URL}/api/competitors/${currentCompetitorId}/entries`);
        const data = await response.json();
        const entry = data.entries.find(e => e.id === id);
        
        if (entry) {
            document.getElementById('entry-id').value = entry.id;
            document.getElementById('dive-number').value = entry.dive_number;
            document.getElementById('fina-code').value = entry.fina_code;
            document.getElementById('difficulty').value = entry.difficulty;
            document.getElementById('description').value = entry.description || '';
            
            editingEntryId = id;
            formTitle.textContent = 'Edit Dive Entry';
            entryForm.style.display = 'block';
            entryForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading entry:', error);
        showMessage('Error loading entry', 'error');
    }
}

async function deleteEntry(id) {
    if (currentSheetStatus === 'submitted') {
        showMessage('Cannot delete entries in a submitted dive sheet', 'error');
        return;
    }

    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/entries/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Entry deleted successfully', 'success');
            loadDiveSheet(currentCompetitorId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error deleting entry', 'error');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        showMessage('Error deleting entry', 'error');
    }
}

async function submitDiveSheet() {
    if (!confirm('Are you sure you want to submit this dive sheet? You won\'t be able to edit it afterwards.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/competitors/${currentCompetitorId}/dive-sheet/submit`, {
            method: 'POST'
        });

        if (response.ok) {
            showMessage('Dive sheet submitted successfully!', 'success');
            loadDiveSheet(currentCompetitorId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error submitting dive sheet', 'error');
        }
    } catch (error) {
        console.error('Error submitting dive sheet:', error);
        showMessage('Error submitting dive sheet', 'error');
    }
}

async function reopenDiveSheet() {
    if (!confirm('Are you sure you want to reopen this dive sheet for editing?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/competitors/${currentCompetitorId}/dive-sheet/reopen`, {
            method: 'POST'
        });

        if (response.ok) {
            showMessage('Dive sheet reopened for editing', 'success');
            loadDiveSheet(currentCompetitorId);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error reopening dive sheet', 'error');
        }
    } catch (error) {
        console.error('Error reopening dive sheet:', error);
        showMessage('Error reopening dive sheet', 'error');
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
