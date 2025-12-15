const API_URL = window.location.origin;

let currentCompetitionId = null;
let currentCompetitionName = null;
let currentEventId = null;
let currentEventName = null;
let numJudges = 5;
let refreshInterval = null;
let currentDiveId = null;
let lastScoreCount = 0;
let autoAdvanceTimeout = null;

// DOM Elements
const competitionSelect = document.getElementById('competition-select');
const eventSelectGroup = document.getElementById('event-select-group');
const eventSelect = document.getElementById('event-select');
const startButtonGroup = document.getElementById('start-button-group');
const startDashboardBtn = document.getElementById('start-dashboard-btn');
const setupSection = document.getElementById('setup-section');
const dashboardContainer = document.getElementById('dashboard-container');

// Event Listeners
competitionSelect.addEventListener('change', handleCompetitionChange);
eventSelect.addEventListener('change', handleEventChange);
startDashboardBtn.addEventListener('click', startDashboard);

// Initialize
loadCompetitions();

async function loadCompetitions() {
    try {
        const response = await fetch(`${API_URL}/api/competitions`);
        const data = await response.json();
        
        if (data.competitions && data.competitions.length > 0) {
            competitionSelect.innerHTML = '<option value="">-- Select a Competition --</option>' +
                data.competitions.map(competition => 
                    `<option value="${competition.id}" data-name="${competition.name}" data-num-judges="${competition.num_judges || 5}">
                        ${competition.name} - ${new Date(competition.date).toLocaleDateString()}
                    </option>`
                ).join('');
        } else {
            competitionSelect.innerHTML = '<option value="">No competitions available</option>';
        }
    } catch (error) {
        console.error('Error loading competitions:', error);
    }
}

async function handleCompetitionChange() {
    const competitionId = competitionSelect.value;
    
    if (competitionId) {
        currentCompetitionId = competitionId;
        const selectedOption = competitionSelect.options[competitionSelect.selectedIndex];
        currentCompetitionName = selectedOption.getAttribute('data-name');
        numJudges = parseInt(selectedOption.getAttribute('data-num-judges')) || 5;
        
        eventSelectGroup.style.display = 'block';
        startButtonGroup.style.display = 'none';
        await loadEvents(competitionId);
    } else {
        currentCompetitionId = null;
        eventSelectGroup.style.display = 'none';
        startButtonGroup.style.display = 'none';
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
    }
}

function handleEventChange() {
    const eventId = eventSelect.value;
    
    if (eventId) {
        currentEventId = eventId;
        const selectedOption = eventSelect.options[eventSelect.selectedIndex];
        currentEventName = selectedOption.getAttribute('data-name');
        startButtonGroup.style.display = 'block';
    } else {
        currentEventId = null;
        startButtonGroup.style.display = 'none';
    }
}

function startDashboard() {
    // Hide setup, show dashboard
    setupSection.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    document.body.classList.add('dashboard-mode');
    
    // Set header info
    document.getElementById('competition-name').textContent = currentCompetitionName;
    document.getElementById('event-name').textContent = currentEventName;
    
    // Start live updates
    loadLiveResults();
    refreshInterval = setInterval(loadLiveResults, 2000); // Poll every 2 seconds
}

async function loadLiveResults() {
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/live-results`);
        const data = await response.json();
        
        if (data.entries && data.entries.length > 0) {
            const nextDive = data.entries.find(e => e.is_next);
            
            if (nextDive) {
                displayCurrentDive(nextDive);
            } else {
                // All dives complete, show leaderboard
                displayFinalLeaderboard();
            }
        } else {
            displayWaitingMessage();
        }
    } catch (error) {
        console.error('Error loading live results:', error);
    }
}

function displayCurrentDive(dive) {
    const currentDiveDisplay = document.getElementById('current-dive-display');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    
    leaderboardContainer.style.display = 'none';
    
    // Check if this is a new dive or score update
    const isNewDive = currentDiveId !== dive.entry_id;
    const scoresChanged = lastScoreCount !== dive.num_scores;
    
    if (isNewDive) {
        currentDiveId = dive.entry_id;
        lastScoreCount = 0;
        clearTimeout(autoAdvanceTimeout);
    }
    
    lastScoreCount = dive.num_scores;
    
    const diverName = `${dive.first_name} ${dive.last_name}`;
    const isComplete = dive.num_scores >= numJudges;
    
    let html = `
        <div class="diver-name">${diverName}</div>
        <div class="dive-info">${dive.club || ''}</div>
        
        <div class="dive-details-grid">
            <div class="dive-detail-item">
                <div class="dive-detail-label">Dive</div>
                <div class="dive-detail-value">#${dive.dive_number}</div>
            </div>
            <div class="dive-detail-item">
                <div class="dive-detail-label">FINA Code</div>
                <div class="dive-detail-value">${dive.fina_code}</div>
            </div>
            <div class="dive-detail-item">
                <div class="dive-detail-label">Difficulty</div>
                <div class="dive-detail-value">${dive.difficulty}</div>
            </div>
        </div>
        
        <div class="dive-info" style="margin-top: 1rem;">
            ${dive.description || ''}
        </div>
        <div class="dive-info" style="font-size: 1.5rem;">
            Height: ${dive.board_height}
        </div>
    `;
    
    // Only show scores when ALL judges have scored
    if (isComplete) {
        html += `
            <div class="scores-display">
                <div class="scores-label">Judge Scores</div>
                <div class="scores-grid">
        `;
        
        const scores = dive.scores_array;
        const sortedScores = [...scores].sort((a, b) => a - b);
        
        for (let i = 1; i <= numJudges; i++) {
            const score = scores[i - 1];
            const isRemoved = numJudges === 5 && 
                             (score === sortedScores[0] || score === sortedScores[sortedScores.length - 1]);
            
            html += `
                <div class="judge-score ${isRemoved ? 'removed' : ''}">
                    <div class="judge-label">Judge ${i}</div>
                    <div class="judge-value">${score.toFixed(1)}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Show final score
        const finalScoreData = calculateFinalScore(scores, dive.difficulty, numJudges);
        html += `
            <div class="final-score-display">
                <div class="final-score-label">Final Score</div>
                <div class="final-score-value">${finalScoreData.finalScore.toFixed(2)}</div>
                <div style="font-size: 1.2rem; margin-top: 0.5rem;">
                    Average: ${finalScoreData.average.toFixed(2)} × DD: ${dive.difficulty} = ${finalScoreData.finalScore.toFixed(2)}
                </div>
            </div>
        `;
        
        html += `</div>`;
        
        // Auto-advance to next dive after 10 seconds when scores first become complete
        if (scoresChanged && dive.num_scores === numJudges) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = setTimeout(() => {
                currentDiveId = null; // Reset to allow next dive to display
                loadLiveResults();
            }, 10000);
        }
    } else {
        // Waiting for all judges to score - don't show partial scores
        html += `
            <div class="waiting-message">
                Waiting for all judge scores...<br>
                <span style="font-size: 1.5rem;">(${dive.num_scores}/${numJudges} judges scored)</span>
            </div>
        `;
    }
    
    currentDiveDisplay.innerHTML = html;
}

function calculateFinalScore(scores, difficulty, numJudges) {
    let scoresArray = [...scores];
    
    // For 5 judges, remove highest and lowest
    if (numJudges === 5 && scoresArray.length >= 5) {
        scoresArray.sort((a, b) => a - b);
        scoresArray = scoresArray.slice(1, -1);
    }
    
    const average = scoresArray.reduce((sum, s) => sum + s, 0) / scoresArray.length;
    const finalScore = average * difficulty;
    
    return { average, finalScore };
}

async function displayFinalLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/leaderboard`);
        const data = await response.json();
        
        const currentDiveDisplay = document.getElementById('current-dive-display');
        const leaderboardContainer = document.getElementById('leaderboard-container');
        
        currentDiveDisplay.innerHTML = `
            <div class="diver-name">Event Complete!</div>
            <div class="dive-info">All dives have been scored</div>
        `;
        
        if (data.leaderboard && data.leaderboard.length > 0) {
            let html = '<h3>Final Standings</h3>';
            
            data.leaderboard.forEach((competitor, index) => {
                const position = index + 1;
                let positionClass = '';
                if (position === 1) positionClass = 'first';
                else if (position === 2) positionClass = 'second';
                else if (position === 3) positionClass = 'third';
                
                html += `
                    <div class="leaderboard-item ${positionClass}">
                        <div><strong>#${position}</strong></div>
                        <div>${competitor.first_name} ${competitor.last_name} ${competitor.club ? `(${competitor.club})` : ''}</div>
                        <div><strong>${competitor.total_score.toFixed(2)}</strong></div>
                    </div>
                `;
            });
            
            leaderboardContainer.innerHTML = html;
            leaderboardContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function displayWaitingMessage() {
    const currentDiveDisplay = document.getElementById('current-dive-display');
    currentDiveDisplay.innerHTML = `
        <div class="waiting-message">
            No dives have been entered yet.<br>
            Please add competitors and dive entries to begin.
        </div>
    `;
}
