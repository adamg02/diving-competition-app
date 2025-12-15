const API_URL = window.location.origin;

let currentCompetitionId = null;
let currentEventId = null;
let currentJudgeNumber = null;
let numJudges = 5;

// DOM Elements
const judgeSelectGroup = document.getElementById('judge-select-group');
const judgeNumberSelect = document.getElementById('judge-number');
const scoringContainer = document.getElementById('scoring-container');
const eventNameSpan = document.getElementById('event-name');
const currentJudgeSpan = document.getElementById('current-judge');
const totalJudgesSpan = document.getElementById('total-judges');
const entriesList = document.getElementById('entries-list');
const competitionStatus = document.getElementById('competition-status');

// Event Listeners
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
        competitionStatus.textContent = 'Loading active event...';
        
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
        
        // Populate judge numbers based on competition settings
        judgeNumberSelect.innerHTML = '<option value="">-- Select Judge Number --</option>' +
            Array.from({length: numJudges}, (_, i) => `<option value="${i + 1}">Judge ${i + 1}</option>`).join('');
        
        await loadActiveEvent(competitionId);
    } else {
        currentCompetitionId = null;
        competitionStatus.textContent = 'Please select a competition from the dropdown above.';
        judgeSelectGroup.style.display = 'none';
        scoringContainer.style.display = 'none';
    }
}

async function loadActiveEvent(competitionId) {
    try {
        const response = await fetch(`${API_URL}/api/competitions/${competitionId}/active-event`);
        const data = await response.json();
        
        if (data.event) {
            currentEventId = data.event.id;
            eventNameSpan.textContent = data.event.name;
            competitionStatus.textContent = `Active Event: ${data.event.name}`;
            judgeSelectGroup.style.display = 'block';
            scoringContainer.style.display = 'none';
        } else {
            currentEventId = null;
            competitionStatus.textContent = 'No active event. Please start an event from the Run Order page.';
            judgeSelectGroup.style.display = 'none';
            scoringContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading active event:', error);
        competitionStatus.textContent = 'Error loading active event';
        showMessage('Error loading active event', 'error');
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
        // Check if event has a run order
        const runOrderResponse = await fetch(`${API_URL}/api/events/${currentEventId}/run-order`);
        const runOrderData = await runOrderResponse.json();
        
        if (runOrderData.runOrder && runOrderData.runOrder.length > 0) {
            // Event is running with run order - show only next diver
            await displayNextDiverInRunOrder(runOrderData.runOrder);
        } else {
            // No run order - show all entries (old behavior)
            const response = await fetch(`${API_URL}/api/events/${currentEventId}/entries`);
            const data = await response.json();
            
            if (data.entries && data.entries.length > 0) {
                displayEntries(data.entries);
            } else {
                entriesList.innerHTML = '<div class="empty-state"><p>No dive entries found for this event.</p></div>';
            }
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        showMessage('Error loading entries', 'error');
    }
}

async function displayNextDiverInRunOrder(runOrder) {
    try {
        // Get event details for num_dives
        const eventResponse = await fetch(`${API_URL}/api/events/${currentEventId}`);
        const eventData = await eventResponse.json();
        const numDives = eventData.event.num_dives || 6;
        
        // Get all scores for this event
        const scoresResponse = await fetch(`${API_URL}/api/events/${currentEventId}/scores`);
        const scoresData = await scoresResponse.json();
        
        // Find the next dive that needs to be scored
        let nextDive = null;
        let currentDiveNumber = 1;
        
        // Go through each dive round
        for (let diveNum = 1; diveNum <= numDives; diveNum++) {
            // Go through each competitor in run order
            for (const competitor of runOrder) {
                // Check if this dive has been fully scored
                const scoreEntry = scoresData.scores.find(s => 
                    s.competitor_id === competitor.competitor_id && 
                    s.dive_number === diveNum
                );
                
                if (!scoreEntry || !scoreEntry.complete) {
                    // This is the next dive to score
                    nextDive = {
                        competitor: competitor,
                        diveNumber: diveNum
                    };
                    break;
                }
            }
            if (nextDive) break;
        }
        
        if (!nextDive) {
            entriesList.innerHTML = `
                <div class="empty-state">
                    <h3>✓ Event Complete</h3>
                    <p>All dives have been scored by all judges.</p>
                </div>
            `;
            return;
        }
        
        // Load entries for this specific competitor
        const entriesResponse = await fetch(`${API_URL}/api/competitors/${nextDive.competitor.competitor_id}/dive-sheet`);
        const entriesData = await entriesResponse.json();
        
        if (!entriesData.entries || entriesData.entries.length === 0) {
            entriesList.innerHTML = `
                <div class="empty-state">
                    <p>Next diver has not submitted their dive sheet yet.</p>
                    <p><strong>${nextDive.competitor.first_name} ${nextDive.competitor.last_name}</strong> (Dive ${nextDive.diveNumber})</p>
                </div>
            `;
            return;
        }
        
        const entry = entriesData.entries.find(e => e.dive_number === nextDive.diveNumber);
        
        if (!entry) {
            entriesList.innerHTML = `
                <div class="empty-state">
                    <p>Waiting for dive sheet entry.</p>
                    <p><strong>${nextDive.competitor.first_name} ${nextDive.competitor.last_name}</strong> - Dive ${nextDive.diveNumber}</p>
                </div>
            `;
            return;
        }
        
        // Get existing score for this judge
        const existingScore = await getExistingScore(entry.id);
        
        // Display the single entry
        entriesList.innerHTML = `
            <div class="next-diver-card">
                <div class="next-diver-header">
                    <h2>Next Diver</h2>
                    <span class="run-position">Position ${nextDive.competitor.run_position} of ${runOrder.length}</span>
                </div>
                
                <div class="diver-info">
                    <h3>${nextDive.competitor.first_name} ${nextDive.competitor.last_name}</h3>
                    ${nextDive.competitor.club ? `<p class="competitor-club">${nextDive.competitor.club}</p>` : ''}
                </div>
                
                <div class="dive-details-large">
                    <div class="dive-detail-item">
                        <span class="label">Dive Number</span>
                        <span class="value">${entry.dive_number} of ${numDives}</span>
                    </div>
                    <div class="dive-detail-item">
                        <span class="label">FINA Code</span>
                        <span class="value fina-code-large">${entry.fina_code}</span>
                    </div>
                    <div class="dive-detail-item">
                        <span class="label">Height</span>
                        <span class="value">${entry.board_height}</span>
                    </div>
                    <div class="dive-detail-item">
                        <span class="label">Difficulty</span>
                        <span class="value difficulty-large">${entry.difficulty}</span>
                    </div>
                </div>
                
                <div class="dive-description-box">
                    <p>${entry.description || 'No description'}</p>
                </div>
                
                <div class="score-submission-box">
                    <label for="score-${entry.id}">Your Score (0-10):</label>
                    <input 
                        type="number" 
                        id="score-${entry.id}" 
                        min="0" 
                        max="10" 
                        step="0.5" 
                        value="${existingScore !== null ? existingScore : ''}"
                        placeholder="0.0"
                        class="score-input-large"
                        autofocus
                    >
                    <button 
                        onclick="submitScore(${entry.id})" 
                        class="btn btn-primary btn-large"
                    >
                        ${existingScore !== null ? 'Update Score' : 'Submit Score'}
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error displaying next diver:', error);
        showMessage('Error loading next diver', 'error');
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
            
            // Move to next diver immediately after this judge submits their score
            setTimeout(() => {
                scoreInput.style.backgroundColor = '';
                loadEntries();
            }, 300);
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
