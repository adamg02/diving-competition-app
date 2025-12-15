const API_URL = window.location.origin;

let currentEventId = null;
let currentEvent = null;
let runOrderData = [];
let scoresData = {};

const eventTitle = document.getElementById('event-title');
const eventSubtitle = document.getElementById('event-subtitle');
const generateOrderBtn = document.getElementById('generate-order-btn');
const stopEventBtn = document.getElementById('stop-event-btn');
const noCompetitorsMessage = document.getElementById('no-competitors-message');
const runOrderTableContainer = document.getElementById('run-order-table-container');
const runOrderTbody = document.getElementById('run-order-tbody');

// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
currentEventId = urlParams.get('eventId');

if (!currentEventId) {
    alert('No event selected');
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadEventAndRunOrder();
    
    generateOrderBtn.addEventListener('click', generateRunOrder);
    stopEventBtn.addEventListener('click', stopEvent);
    
    // Poll for score updates every 3 seconds
    setInterval(loadScores, 3000);
});

async function loadEventAndRunOrder() {
    try {
        // Load event details
        const eventResponse = await fetch(`${API_URL}/api/events/${currentEventId}`);
        const eventData = await eventResponse.json();
        currentEvent = eventData.event;
        
        if (!currentEvent) {
            alert('Event not found');
            window.location.href = '/';
            return;
        }
        
        eventTitle.textContent = `Run Order: ${currentEvent.name}`;
        eventSubtitle.textContent = `${currentEvent.num_dives || 6} dives per competitor`;
        
        // Load competitors
        const competitorsResponse = await fetch(`${API_URL}/api/events/${currentEventId}/competitors`);
        const competitorsData = await competitorsResponse.json();
        
        if (!competitorsData.competitors || competitorsData.competitors.length === 0) {
            noCompetitorsMessage.style.display = 'block';
            runOrderTableContainer.style.display = 'none';
            generateOrderBtn.style.display = 'none';
            stopEventBtn.style.display = 'none';
            return;
        }
        
        // Load or check for existing run order
        const runOrderResponse = await fetch(`${API_URL}/api/events/${currentEventId}/run-order`);
        const runOrderResult = await runOrderResponse.json();
        
        if (runOrderResult.runOrder && runOrderResult.runOrder.length > 0) {
            // Run order exists
            runOrderData = runOrderResult.runOrder;
            generateOrderBtn.style.display = 'none';
            stopEventBtn.style.display = 'inline-block';
            displayRunOrder();
            await loadScores();
        } else {
            // No run order yet
            generateOrderBtn.style.display = 'inline-block';
            stopEventBtn.style.display = 'none';
            noCompetitorsMessage.style.display = 'none';
            runOrderTableContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading event:', error);
        showMessage('Error loading event', 'error');
    }
}

async function generateRunOrder() {
    if (!confirm('Generate random draw order for this event? This will start the competition.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/run-order`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            runOrderData = data.runOrder;
            showMessage('Run order generated successfully', 'success');
            generateOrderBtn.style.display = 'none';
            stopEventBtn.style.display = 'inline-block';
            displayRunOrder();
            await loadScores();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error generating run order', 'error');
        }
    } catch (error) {
        console.error('Error generating run order:', error);
        showMessage('Error generating run order', 'error');
    }
}

async function stopEvent() {
    if (!confirm('Stop this event? This will clear the run order and allow you to regenerate it.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/run-order`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Event stopped successfully', 'success');
            await loadEventAndRunOrder();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error stopping event', 'error');
        }
    } catch (error) {
        console.error('Error stopping event:', error);
        showMessage('Error stopping event', 'error');
    }
}

function displayRunOrder() {
    noCompetitorsMessage.style.display = 'none';
    runOrderTableContainer.style.display = 'block';
    
    const numDives = currentEvent.num_dives || 6;
    
    // Build table header with dive columns
    const tableHead = document.querySelector('.run-order-table thead tr');
    // Remove all dynamic columns (keep only Position, Diver Name, Club)
    while (tableHead.children.length > 3) {
        tableHead.removeChild(tableHead.children[3]);
    }
    
    // Add dive columns
    for (let i = 1; i <= numDives; i++) {
        const th = document.createElement('th');
        th.textContent = `Dive ${i}`;
        tableHead.appendChild(th);
    }
    
    // Add Total Score column at the end
    const totalTh = document.createElement('th');
    totalTh.textContent = 'Total Score';
    tableHead.appendChild(totalTh);
    
    // Build table body
    runOrderTbody.innerHTML = runOrderData.map((item, index) => {
        const diveScores = [];
        let totalScore = 0;
        
        for (let diveNum = 1; diveNum <= numDives; diveNum++) {
            const entryKey = `${item.competitor_id}_${diveNum}`;
            const score = scoresData[entryKey];
            
            if (score !== undefined && score !== null) {
                diveScores.push(`<td class="score-cell">${score.toFixed(2)}</td>`);
                totalScore += score;
            } else {
                diveScores.push(`<td class="score-cell empty">-</td>`);
            }
        }
        
        return `
            <tr>
                <td class="position-cell">${item.run_position}</td>
                <td class="name-cell"><strong>${item.first_name} ${item.last_name}</strong></td>
                <td>${item.club || '-'}</td>
                ${diveScores.join('')}
                <td class="total-cell"><strong>${totalScore > 0 ? totalScore.toFixed(2) : '-'}</strong></td>
            </tr>
        `;
    }).join('');
}

async function loadScores() {
    if (!runOrderData || runOrderData.length === 0) return;
    
    try {
        const response = await fetch(`${API_URL}/api/events/${currentEventId}/scores`);
        const data = await response.json();
        
        // Build scores map: competitor_id + dive_number -> final score
        scoresData = {};
        if (data.scores && Array.isArray(data.scores)) {
            data.scores.forEach(scoreEntry => {
                const key = `${scoreEntry.competitor_id}_${scoreEntry.dive_number}`;
                scoresData[key] = scoreEntry.final_score;
            });
        }
        
        // Refresh display
        displayRunOrder();
        
    } catch (error) {
        console.error('Error loading scores:', error);
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}
