// Global Competition Selector
// This manages the competition selection that persists across all pages

const STORAGE_KEY = 'selectedCompetitionId';

let globalCompetitionId = null;
let globalCompetitionName = null;

// Initialize competition selector
async function initCompetitionSelector() {
    const selector = document.getElementById('global-competition-select');
    if (!selector) return;

    // Load competitions
    try {
        const response = await fetch('/api/competitions');
        const data = await response.json();
        
        // Populate selector
        selector.innerHTML = '<option value="">Select a competition...</option>';
        data.competitions.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.id;
            option.textContent = `${comp.name} - ${new Date(comp.date).toLocaleDateString()}`;
            selector.appendChild(option);
        });

        // Restore previously selected competition
        const savedId = localStorage.getItem(STORAGE_KEY);
        if (savedId && data.competitions.find(c => c.id == savedId)) {
            selector.value = savedId;
            updateGlobalCompetition(savedId);
        }

        // Listen for changes
        selector.addEventListener('change', (e) => {
            const competitionId = e.target.value;
            if (competitionId) {
                localStorage.setItem(STORAGE_KEY, competitionId);
                updateGlobalCompetition(competitionId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
                globalCompetitionId = null;
                globalCompetitionName = null;
                window.dispatchEvent(new CustomEvent('competitionChanged', { 
                    detail: { id: null, name: null } 
                }));
            }
        });

    } catch (error) {
        console.error('Error loading competitions:', error);
    }
}

// Update global competition context
function updateGlobalCompetition(competitionId) {
    globalCompetitionId = competitionId;
    
    // Get competition name from selector
    const selector = document.getElementById('global-competition-select');
    const selectedOption = selector.options[selector.selectedIndex];
    globalCompetitionName = selectedOption ? selectedOption.textContent : '';
    
    // Dispatch event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('competitionChanged', { 
        detail: { id: globalCompetitionId, name: globalCompetitionName } 
    }));
}

// Get current competition
function getGlobalCompetition() {
    return {
        id: globalCompetitionId,
        name: globalCompetitionName
    };
}

// Check if competition is selected
function isCompetitionSelected() {
    return globalCompetitionId !== null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCompetitionSelector);
