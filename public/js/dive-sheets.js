const API_URL = window.location.origin;

let currentCompetitionId = null;
let currentCompetitorId = null;
let editingEntryId = null;
let currentSheetStatus = 'draft';
let competitorsData = [];

// DOM Elements
const competitorsListView = document.getElementById('competitors-list-view');
const competitorsCardsContainer = document.getElementById('competitors-cards-container');
const diveSheetContainer = document.getElementById('dive-sheet-container');
const backToListBtn = document.getElementById('back-to-list-btn');
const competitorNameHeader = document.getElementById('competitor-name');
const entryForm = document.getElementById('entry-form');
const entryFormElement = document.getElementById('entry-form-element');
const newEntryBtn = document.getElementById('new-entry-btn');
const cancelEntryBtn = document.getElementById('cancel-entry-btn');
const entriesList = document.getElementById('entries-list');
const formTitle = document.getElementById('form-title');
const sheetStatus = document.getElementById('sheet-status');
const submitSheetBtn = document.getElementById('submit-sheet-btn');
const reopenSheetBtn = document.getElementById('reopen-sheet-btn');
const competitionStatus = document.getElementById('competition-status');

// Event Listeners
backToListBtn.addEventListener('click', showCompetitorsList);
newEntryBtn.addEventListener('click', showEntryForm);
cancelEntryBtn.addEventListener('click', hideEntryForm);
entryFormElement.addEventListener('submit', handleEntrySubmit);
submitSheetBtn.addEventListener('click', submitDiveSheet);
reopenSheetBtn.addEventListener('click', reopenDiveSheet);

// Add FINA code auto-population listener
const finaCodeInput = document.getElementById('fina-code');
const boardHeightSelect = document.getElementById('board-height');

finaCodeInput.addEventListener('blur', autoPopulateDiveInfo);
finaCodeInput.addEventListener('input', () => {
    // Auto-populate on input if code looks complete (3-4 digits + letter)
    const code = finaCodeInput.value.toUpperCase().trim();
    if (code.length >= 4 && /^[1-6]\d{2,3}[A-D]$/.test(code) && boardHeightSelect.value) {
        autoPopulateDiveInfo();
    }
});

// Also auto-populate when height changes
boardHeightSelect.addEventListener('change', autoPopulateDiveInfo);

// Listen for global competition changes
window.addEventListener('competitionChanged', (event) => {
    const { id, name } = event.detail;
    handleCompetitionChange(id, name);
});

// Initialize - check if competition is already selected
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const comp = getGlobalCompetition();
        if (comp.id) {
            handleCompetitionChange(comp.id, comp.name);
        }
    }, 100);
});

// Auto-populate difficulty and description based on FINA code and board height
function autoPopulateDiveInfo() {
    const finaCode = document.getElementById('fina-code').value.toUpperCase().trim();
    const boardHeight = document.getElementById('board-height').value;
    const difficultyInput = document.getElementById('difficulty');
    const descriptionInput = document.getElementById('description');
    
    // Need both code and height to auto-populate
    if (!finaCode || !boardHeight) {
        return;
    }
    
    // Only auto-populate if code is valid
    if (finaCode && isValidFinaCode(finaCode)) {
        const diveInfo = getDiveInfo(finaCode, boardHeight);
        
        if (diveInfo) {
            // Auto-populate difficulty if empty or not manually changed
            if (!difficultyInput.value || !difficultyInput.dataset.manuallyEdited) {
                difficultyInput.value = diveInfo.difficulty;
                difficultyInput.style.backgroundColor = '#e8f5e9'; // Light green to indicate auto-filled
            }
            
            // Auto-populate description if empty or not manually changed
            if (!descriptionInput.value || !descriptionInput.dataset.manuallyEdited) {
                descriptionInput.value = diveInfo.description;
                descriptionInput.style.backgroundColor = '#e8f5e9'; // Light green to indicate auto-filled
            }
            
            // Show success message
            const message = document.createElement('div');
            message.className = 'auto-fill-message';
            message.textContent = `✓ Auto-filled: ${diveInfo.description} (DD: ${diveInfo.difficulty} from ${boardHeight})`;
            message.style.cssText = 'color: #4caf50; font-size: 0.9em; margin-top: 5px; animation: fadeIn 0.3s;';
            
            // Remove any existing message
            const existingMessage = finaCodeInput.parentElement.querySelector('.auto-fill-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            finaCodeInput.parentElement.appendChild(message);
            setTimeout(() => message.remove(), 3000);
        } else if (isDiveAvailableAtHeight && !isDiveAvailableAtHeight(finaCode, boardHeight)) {
            // Code is valid but not available at this height
            const message = document.createElement('div');
            message.className = 'auto-fill-message';
            message.textContent = `⚠ Dive ${finaCode} is not available from ${boardHeight}. Please select a different height or dive code.`;
            message.style.cssText = 'color: #ff9800; font-size: 0.9em; margin-top: 5px;';
            
            const existingMessage = finaCodeInput.parentElement.querySelector('.auto-fill-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            finaCodeInput.parentElement.appendChild(message);
            setTimeout(() => message.remove(), 5000);
        } else {
            // Code format is valid but not in database
            const message = document.createElement('div');
            message.className = 'auto-fill-message';
            message.textContent = '⚠ Valid FINA code format, but not in database. Please enter difficulty and description manually.';
            message.style.cssText = 'color: #ff9800; font-size: 0.9em; margin-top: 5px;';
            
            const existingMessage = finaCodeInput.parentElement.querySelector('.auto-fill-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            finaCodeInput.parentElement.appendChild(message);
            setTimeout(() => message.remove(), 4000);
        }
    }
}

async function handleCompetitionChange(competitionId, competitionName) {
    if (competitionId) {
        currentCompetitionId = competitionId;
        competitionStatus.textContent = `Viewing: ${competitionName}`;
        await loadCompetitorsWithDiveSheets(competitionId);
        showCompetitorsList();
    } else {
        currentCompetitionId = null;
        competitionStatus.textContent = 'Please select a competition from the dropdown above.';
        competitorsListView.style.display = 'none';
        diveSheetContainer.style.display = 'none';
    }
}

async function loadCompetitorsWithDiveSheets(competitionId) {
    try {
        const response = await fetch(`${API_URL}/api/competitions/${competitionId}/competitors`);
        const data = await response.json();
        
        if (data.competitors && data.competitors.length > 0) {
            // Load dive sheets and event details for each competitor
            competitorsData = await Promise.all(data.competitors.map(async (competitor) => {
                try {
                    const [sheetResponse, eventResponse] = await Promise.all([
                        fetch(`${API_URL}/api/competitors/${competitor.id}/dive-sheet`),
                        fetch(`${API_URL}/api/events/${competitor.event_id}`)
                    ]);
                    const sheetData = await sheetResponse.json();
                    const eventData = await eventResponse.json();
                    return {
                        ...competitor,
                        entries: sheetData.entries || [],
                        sheetStatus: sheetData.dive_sheet?.status || 'draft',
                        num_dives: eventData.event?.num_dives || 6
                    };
                } catch (error) {
                    return {
                        ...competitor,
                        entries: [],
                        sheetStatus: 'draft',
                        num_dives: 6
                    };
                }
            }));
            
            displayCompetitorCards();
        } else {
            competitorsData = [];
            competitorsCardsContainer.innerHTML = '<div class="empty-state"><p>No competitors found in this competition.</p></div>';
        }
    } catch (error) {
        console.error('Error loading competitors:', error);
        showMessage('Error loading competitors', 'error');
    }
}

function displayCompetitorCards() {
    competitorsCardsContainer.innerHTML = competitorsData.map(competitor => {
        const requiredDives = competitor.num_dives || 6;
        const currentDives = competitor.entries.length;
        const isComplete = currentDives >= requiredDives;
        const progressClass = isComplete ? 'progress-complete' : (currentDives > 0 ? 'progress-partial' : 'progress-empty');
        
        return `
            <div class="competitor-card">
                <div class="competitor-header">
                    <h3>${competitor.first_name} ${competitor.last_name}</h3>
                    <span class="event-badge">${competitor.event_name}</span>
                    <span class="dive-progress ${progressClass}">${currentDives}/${requiredDives}</span>
                    <span class="status-badge status-${competitor.sheetStatus}">${competitor.sheetStatus}</span>
                </div>
                <div class="competitor-dives">
                    ${competitor.entries.length > 0 ? 
                        competitor.entries.map(entry => `
                            <span class="dive-chip">${entry.fina_code} (${entry.board_height})</span>
                        `).join('') 
                        : '<span class="no-dives">No dives entered yet</span>'}
                </div>
                <div class="competitor-actions">
                    <button class="btn btn-primary" onclick="editCompetitorSheet(${competitor.id}, '${competitor.first_name} ${competitor.last_name}')">
                        ${competitor.entries.length > 0 ? 'Edit Dive Sheet' : 'Add Dives'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showCompetitorsList() {
    competitorsListView.style.display = 'block';
    diveSheetContainer.style.display = 'none';
    currentCompetitorId = null;
}

function editCompetitorSheet(competitorId, competitorName) {
    currentCompetitorId = competitorId;
    competitorNameHeader.textContent = competitorName;
    competitorsListView.style.display = 'none';
    diveSheetContainer.style.display = 'block';
    entryForm.style.display = 'none';
    loadDiveSheet(competitorId);
}

async function loadDiveSheet(competitorId) {
    try {
        const response = await fetch(`${API_URL}/api/competitors/${competitorId}/dive-sheet`);
        const data = await response.json();
        
        // Update status
        if (data.dive_sheet && data.dive_sheet.status) {
            currentSheetStatus = data.dive_sheet.status;
            sheetStatus.textContent = currentSheetStatus.charAt(0).toUpperCase() + currentSheetStatus.slice(1);
            
            // Check if dive limit reached
            const competitor = competitorsData.find(c => c.id === competitorId);
            const requiredDives = competitor ? competitor.num_dives : 6;
            const currentDives = data.entries ? data.entries.length : 0;
            const limitReached = currentDives >= requiredDives;
            
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
                newEntryBtn.disabled = limitReached;
                if (limitReached) {
                    newEntryBtn.title = `Maximum ${requiredDives} dives reached`;
                } else {
                    newEntryBtn.title = '';
                }
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
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<div class="empty-state"><p>No dive entries yet. Add your first dive!</p></div>';
        return;
    }
    
    entriesList.innerHTML = `
        <table class="entries-table">
            <thead>
                <tr>
                    <th>FINA Code</th>
                    <th>Height</th>
                    <th>Difficulty</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map(entry => `
                    <tr>
                        <td class="fina-code-cell">${entry.fina_code}</td>
                        <td>${entry.board_height || 'N/A'}</td>
                        <td class="difficulty-cell">${entry.difficulty}</td>
                        <td class="description-cell">${entry.description || '-'}</td>
                        <td class="actions-cell">
                            <button class="btn btn-small btn-primary" onclick="editEntry(${entry.id})" ${isSubmitted ? 'disabled' : ''}>Edit</button>
                            <button class="btn btn-small btn-danger" onclick="deleteEntry(${entry.id})" ${isSubmitted ? 'disabled' : ''}>Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showEntryForm() {
    // Check dive limit before showing form
    const competitor = competitorsData.find(c => c.id === currentCompetitorId);
    const requiredDives = competitor ? competitor.num_dives : 6;
    const currentDives = competitor ? competitor.entries.length : 0;
    
    if (currentDives >= requiredDives) {
        alert(`Maximum number of dives (${requiredDives}) has been reached for this event.`);
        return;
    }
    
    entryForm.style.display = 'block';
    formTitle.textContent = 'Add Dive Entry';
    editingEntryId = null;
    entryFormElement.reset();
    
    // Reset auto-fill tracking
    const difficultyInput = document.getElementById('difficulty');
    const descriptionInput = document.getElementById('description');
    const boardHeightSelect = document.getElementById('board-height');
    delete difficultyInput.dataset.manuallyEdited;
    delete descriptionInput.dataset.manuallyEdited;
    difficultyInput.style.backgroundColor = '';
    descriptionInput.style.backgroundColor = '';
    
    // Add manual edit tracking listeners
    difficultyInput.addEventListener('input', function() {
        this.dataset.manuallyEdited = 'true';
        this.style.backgroundColor = '';
    }, { once: true });
    
    descriptionInput.addEventListener('input', function() {
        this.dataset.manuallyEdited = 'true';
        this.style.backgroundColor = '';
    }, { once: true });
    
    entryForm.scrollIntoView({ behavior: 'smooth' });
}

function hideEntryForm() {
    entryForm.style.display = 'none';
    editingEntryId = null;
    entryFormElement.reset();
    
    // Clear auto-fill indicators
    const difficultyInput = document.getElementById('difficulty');
    const descriptionInput = document.getElementById('description');
    delete difficultyInput.dataset.manuallyEdited;
    delete descriptionInput.dataset.manuallyEdited;
    difficultyInput.style.backgroundColor = '';
    descriptionInput.style.backgroundColor = '';
}

async function handleEntrySubmit(e) {
    e.preventDefault();
    
    const entryData = {
        fina_code: document.getElementById('fina-code').value.toUpperCase(),
        board_height: document.getElementById('board-height').value,
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
            // Check dive limit before adding new entry
            const competitor = competitorsData.find(c => c.id === currentCompetitorId);
            const requiredDives = competitor ? competitor.num_dives : 6;
            const currentDives = competitor ? competitor.entries.length : 0;
            
            if (currentDives >= requiredDives) {
                showMessage(`Maximum number of dives (${requiredDives}) has been reached for this event`, 'error');
                return;
            }
            
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
            // Refresh competitor data to update progress indicator
            loadCompetitorsWithDiveSheets(currentCompetitionId);
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
            document.getElementById('fina-code').value = entry.fina_code;
            document.getElementById('board-height').value = entry.board_height || '';
            document.getElementById('difficulty').value = entry.difficulty;
            document.getElementById('description').value = entry.description || '';
            
            // Mark fields as manually edited since they contain existing data
            const difficultyInput = document.getElementById('difficulty');
            const descriptionInput = document.getElementById('description');
            difficultyInput.dataset.manuallyEdited = 'true';
            descriptionInput.dataset.manuallyEdited = 'true';
            
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
