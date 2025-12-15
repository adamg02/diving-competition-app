const API_URL = window.location.origin;

let currentCompetitionId = null;
let currentEventId = null;
let currentJudgeNumber = null;
let numJudges = 5;

// DOM Elements
const eventSelectGroup = document.getElementById('event-select-group');
const eventSelect = document.getElementById('event-select');
const judgeSelectGroup = document.getElementById('judge-select-group');
const judgeNumberSelect = document.getElementById('judge-number');
const scoringContainer = document.getElementById('scoring-container');
const eventNameSpan = document.getElementById('event-name');
const currentJudgeSpan = document.getElementById('current-judge');
const totalJudgesSpan = document.getElementById('total-judges');
const entriesList = document.getElementById('entries-list');
const competitionStatus = document.getElementById('competition-status');

// Event Listeners
eventSelect.addEventListener('change', handleEventChange);
judgeNumberSelect.addEventListener('change', handleJudgeChange);

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

async function handleCompetitionChange(competitionId, competitionName) {
    if (competitionId) {
        currentCompetitionId = competitionId;
        competitionStatus.textContent = `Viewing: ${competitionName}`;
        
        // Fetch competition details to get num_judges
        try {
            const response = await fetch(`${API_URL}/api/competitions`);
            const data = await response.json();
            const competition = data.competitions.find(c => c.id == competitionId);
            numJudges = competition ? (parseInt(competition.num_judges) || 5) : 5;
        } catch (error) {
            console.error('Error loading competition details:', error);
            numJudges = 5;
        }
        
        eventSelectGroup.style.display = 'block';
        judgeSelectGroup.style.display = 'none';
        scoringContainer.style.display = 'none';
        
        // Populate judge numbers based on competition settings
        judgeNumberSelect.innerHTML = '<option value="">-- Select Judge Number --</option>' +
            Array.from({length: numJudges}, (_, i) => `<option value="${i + 1}">Judge ${i + 1}</option>`).join('');
        
        await loadEvents(competitionId);
    } else {
        currentCompetitionId = null;
        competitionStatus.textContent = 'Please select a competition from the dropdown above.';
        eventSelectGroup.style.display = 'none';
        judgeSelectGroup.style.display = 'none';
        scoringContainer.style.display = 'none';
    }
}

async function loadEvents(competitionId) {
    try {
        const response = await fetch(`${API_URL}/api/competitions/${competitionId}/events`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            eventSelect.innerHTML = '<option value="">-- Select an Event --</option>' +
                data.events.map(event => 
                    `<option value="${event.id}" data-name="${event.name}">${event.name}</option>`
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
        const selectedOption = eventSelect.options[eventSelect.selectedIndex];
        const eventName = selectedOption.getAttribute('data-name');
        
        eventNameSpan.textContent = eventName;
        judgeSelectGroup.style.display = 'block';
        scoringContainer.style.display = 'none';
    } else {
        currentEventId = null;
        judgeSelectGroup.style.display = 'none';
        scoringContainer.style.display = 'none';
    }
}

function handleJudgeChange() {
    const judgeNumber = judgeNumberSelect.value;
    
    if (judgeNumber) {
        currentJudgeNumber = parseInt(judgeNumber);
        currentJudgeSpan.textContent = currentJudgeNumber;
        totalJudgesSpan.textContent = numJudges;
        scoringContainer.style.display = 'block';
        loadEntries();
    } else {
        currentJudgeNumber = null;
        scoringContainer.style.display = 'none';
    }
}

async function loadEntries() {
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/entries`);
        const data = await response.json();
        
        if (data.entries && data.entries.length > 0) {
            displayEntries(data.entries);
        } else {
            entriesList.innerHTML = '<div class="empty-state"><p>No dive entries found for this event.</p></div>';
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        showMessage('Error loading entries', 'error');
    }
}

async function displayEntries(entries) {
    // Group entries by competitor
    const competitorGroups = {};
    entries.forEach(entry => {
        const competitorKey = `${entry.first_name} ${entry.last_name}`;
        if (!competitorGroups[competitorKey]) {
            competitorGroups[competitorKey] = {
                name: competitorKey,
                club: entry.club,
                entries: []
            };
        }
        competitorGroups[competitorKey].entries.push(entry);
    });
    
    // Display each competitor's dives
    let html = '';
    for (const competitorKey in competitorGroups) {
        const competitor = competitorGroups[competitorKey];
        html += `
            <div class="competitor-section">
                <h3>${competitor.name}</h3>
                ${competitor.club ? `<p class="competitor-club">${competitor.club}</p>` : ''}
                <div class="entries-grid">
        `;
        
        for (const entry of competitor.entries) {
            // Get existing score for this judge if any
            const existingScore = await getExistingScore(entry.id);
            
            html += `
                <div class="entry-card">
                    <div class="entry-header">
                        <strong>Dive ${entry.dive_number}</strong>
                        <span class="fina-code">${entry.fina_code}</span>
                    </div>
                    <p class="dive-description">${entry.description || 'No description'}</p>
                    <p class="dive-details">
                        <span>Height: ${entry.board_height}</span>
                        <span>DD: ${entry.difficulty}</span>
                    </p>
                    <div class="score-progress">
                        <small>${entry.num_scores || 0}/${numJudges} judges scored</small>
                    </div>
                    <div class="score-input-group">
                        <label for="score-${entry.id}">Your Score (0-10):</label>
                        <input 
                            type="number" 
                            id="score-${entry.id}" 
                            min="0" 
                            max="10" 
                            step="0.5" 
                            value="${existingScore !== null ? existingScore : ''}"
                            placeholder="0.0"
                            class="score-input"
                        >
                        <button 
                            onclick="submitScore(${entry.id})" 
                            class="btn btn-primary btn-sm"
                        >
                            ${existingScore !== null ? 'Update' : 'Submit'}
                        </button>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    entriesList.innerHTML = html;
}

async function getExistingScore(entryId) {
    try {
        const response = await fetch(`${API_URL}/api/entries/${entryId}/scores`);
        const data = await response.json();
        
        if (data.scores && data.scores.length > 0) {
            const judgeScore = data.scores.find(s => s.judge_number === currentJudgeNumber);
            return judgeScore ? judgeScore.score : null;
        }
        return null;
    } catch (error) {
        console.error('Error loading existing score:', error);
        return null;
    }
}

async function submitScore(entryId) {
    const scoreInput = document.getElementById(`score-${entryId}`);
    const score = parseFloat(scoreInput.value);
    
    if (isNaN(score) || score < 0 || score > 10) {
        showMessage('Please enter a valid score between 0 and 10', 'error');
        return;
    }
    
    // Validate 0.5 increments
    if ((score * 2) % 1 !== 0) {
        showMessage('Score must be in 0.5 increments (e.g., 7.0, 7.5, 8.0)', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entry_id: entryId,
                judge_number: currentJudgeNumber,
                score: score
            })
        });
        
        if (response.ok) {
            showMessage('Score submitted successfully!', 'success');
            scoreInput.style.backgroundColor = '#e8f5e9'; // Light green
            
            // Reload entries to update progress
            setTimeout(() => {
                scoreInput.style.backgroundColor = '';
                loadEntries();
            }, 1000);
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to submit score', 'error');
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        showMessage('Error submitting score', 'error');
    }
}

function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}
