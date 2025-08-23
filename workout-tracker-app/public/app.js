// Global state
let currentWeek = 1;
let workoutData = null;
let config = null;

// Initialize the app
async function init() {
    try {
        // Load configuration
        const configResponse = await fetch('/api/config');
        config = await configResponse.json();
        
        // Load workout data
        const dataResponse = await fetch('/api/workout-data');
        workoutData = await dataResponse.json();
        
        // Set initial start date
        document.getElementById('startDate').value = workoutData.startDate;
        
        // Load current week
        await loadWeek(currentWeek);
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        alert('Failed to load application. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('prevWeek').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('nextWeek').addEventListener('click', () => navigateWeek(1));
    
    // Start date
    document.getElementById('setStartDate').addEventListener('click', updateStartDate);
    
    // Export
    document.getElementById('exportWeek').addEventListener('click', exportWeek);
    
    // Save week (will be added dynamically)
}

// Navigate between weeks
function navigateWeek(direction) {
    const newWeek = currentWeek + direction;
    if (newWeek >= 1) {
        currentWeek = newWeek;
        loadWeek(currentWeek);
    }
}

// Update start date
async function updateStartDate() {
    const startDate = document.getElementById('startDate').value;
    if (!startDate) return;
    
    try {
        const response = await fetch('/api/set-start-date', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate })
        });
        
        if (response.ok) {
            workoutData.startDate = startDate;
            currentWeek = 1;
            await loadWeek(currentWeek);
        }
    } catch (error) {
        console.error('Failed to update start date:', error);
        alert('Failed to update start date');
    }
}

// Load week data
async function loadWeek(weekNumber) {
    try {
        showLoading();
        
        const response = await fetch(`/api/week/${weekNumber}`);
        const weekData = await response.json();
        
        // Update UI
        document.getElementById('weekLabel').textContent = `Week ${weekNumber}`;
        document.getElementById('weekRange').textContent = 
            `${formatDate(weekData.startDate)} - ${formatDate(weekData.endDate)}`;
        
        // Render week content
        renderWeekContent(weekData);
        
    } catch (error) {
        console.error('Failed to load week:', error);
        alert('Failed to load week data');
    }
}

// Show loading state
function showLoading() {
    document.getElementById('weekContent').innerHTML = 
        '<div class="loading">Loading week data...</div>';
}

// Render week content
function renderWeekContent(weekData) {
    const container = document.getElementById('weekContent');
    container.innerHTML = '';
    
    // Create day sections
    weekData.days.forEach((day, dayIndex) => {
        const daySection = createDaySection(day, dayIndex);
        container.appendChild(daySection);
    });
    
    // Add save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-week-btn';
    saveBtn.textContent = 'Save Week';
    saveBtn.onclick = () => saveWeek(weekData);
    container.appendChild(saveBtn);
}

// Create day section
function createDaySection(day, dayIndex) {
    const section = document.createElement('div');
    section.className = 'day-section';
    section.dataset.dayIndex = dayIndex;
    
    // Day header
    const header = document.createElement('div');
    header.className = 'day-header';
    header.innerHTML = `
        <h3 class="day-title">${day.dayName}</h3>
        <span class="day-date">${formatDate(day.date)}</span>
    `;
    section.appendChild(header);
    
    // Focus areas
    const focusSection = createFocusSection(day, dayIndex);
    section.appendChild(focusSection);
    
    // Exercises
    const exercisesSection = createExercisesSection(day, dayIndex);
    section.appendChild(exercisesSection);
    
    // Cardio and Notes
    const cardioNotesSection = createCardioNotesSection(day, dayIndex);
    section.appendChild(cardioNotesSection);
    
    return section;
}

// Create focus section
function createFocusSection(day, dayIndex) {
    const focusDiv = document.createElement('div');
    focusDiv.className = 'focus-areas';
    
    // Weights group
    const weightsGroup = document.createElement('div');
    weightsGroup.className = 'focus-group';
    weightsGroup.innerHTML = '<h4>Weights</h4>';
    
    // Add "None" option first
    const noneOption = createFocusCheckbox({ id: 'none', name: 'None' }, day, dayIndex);
    weightsGroup.appendChild(noneOption);
    
    config.focusAreas.weights.forEach(area => {
        const checkbox = createFocusCheckbox(area, day, dayIndex);
        weightsGroup.appendChild(checkbox);
    });
    
    // Other group
    const otherGroup = document.createElement('div');
    otherGroup.className = 'focus-group';
    otherGroup.innerHTML = '<h4>Other</h4>';
    
    config.focusAreas.other.forEach(area => {
        const checkbox = createFocusCheckbox(area, day, dayIndex);
        otherGroup.appendChild(checkbox);
    });
    
    focusDiv.appendChild(weightsGroup);
    focusDiv.appendChild(otherGroup);
    
    return focusDiv;
}

// Create focus checkbox
function createFocusCheckbox(area, day, dayIndex) {
    const div = document.createElement('div');
    div.className = 'focus-checkbox';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `focus-${dayIndex}`;
    radio.id = `focus-${dayIndex}-${area.id}`;
    radio.value = area.id;
    radio.checked = day.focusAreas.includes(area.id);
    radio.onchange = () => updateExerciseDropdowns(dayIndex);
    
    const label = document.createElement('label');
    label.htmlFor = radio.id;
    label.textContent = area.name;
    
    div.appendChild(radio);
    div.appendChild(label);
    
    return div;
}

// Create exercises section
function createExercisesSection(day, dayIndex) {
    const section = document.createElement('div');
    section.className = 'exercises-section';
    section.id = `exercises-${dayIndex}`;
    
    const header = document.createElement('div');
    header.className = 'exercises-header';
    header.textContent = 'Exercises';
    section.appendChild(header);
    
    // Add set labels
    const setLabels = document.createElement('div');
    setLabels.className = 'set-labels-row';
    setLabels.id = `set-labels-${dayIndex}`;
    
    // Check if cardio is selected
    const focusAreas = getSelectedFocusAreas(dayIndex);
    const isCardio = focusAreas.includes('cardio');
    
    if (isCardio) {
        setLabels.innerHTML = `
            <div class="exercise-label">Exercise</div>
            <div class="set-label">Set 1</div>
            <div class="set-label">Set 2</div>
            <div class="set-label">Set 3</div>
            <div class="set-label">Set 4</div>
            <div class="set-label">Set 5</div>
            <div></div>
        `;
    } else {
        setLabels.innerHTML = `
            <div class="exercise-label">Exercise</div>
            <div class="set-label">Set 1</div>
            <div class="set-label">Set 2</div>
            <div class="set-label">Set 3</div>
            <div class="set-label">Set 4</div>
            <div class="set-label">Set 5</div>
            <div></div>
        `;
    }
    
    section.appendChild(setLabels);
    
    const exercisesContainer = document.createElement('div');
    exercisesContainer.id = `exercise-rows-${dayIndex}`;
    
    // Add existing exercises
    day.exercises.forEach((exercise, exerciseIndex) => {
        const row = createExerciseRow(dayIndex, exerciseIndex, exercise);
        exercisesContainer.appendChild(row);
    });
    
    section.appendChild(exercisesContainer);
    
    // Add exercise button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-exercise-btn';
    addBtn.textContent = 'Add Exercise';
    addBtn.onclick = () => addExercise(dayIndex);
    section.appendChild(addBtn);
    
    return section;
}

// Create exercise row
function createExerciseRow(dayIndex, exerciseIndex, exerciseData = null) {
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.dataset.exerciseIndex = exerciseIndex;
    
    // Exercise select
    const select = document.createElement('select');
    select.className = 'exercise-select';
    select.id = `exercise-${dayIndex}-${exerciseIndex}`;
    
    // Will be populated based on focus areas
    updateExerciseOptions(select, dayIndex);
    
    if (exerciseData) {
        select.value = exerciseData.name;
    }
    
    row.appendChild(select);
    
    // Check if cardio is selected
    const focusAreas = getSelectedFocusAreas(dayIndex);
    const isCardio = focusAreas.includes('cardio');
    
    // Create 5 sets
    for (let setNum = 1; setNum <= 5; setNum++) {
        const setData = exerciseData && exerciseData.sets ? exerciseData.sets[setNum - 1] : { reps: '', weight: '', time: '', intensity: '' };
        
        if (isCardio) {
            // Time input
            const timeInput = document.createElement('input');
            timeInput.type = 'text';
            timeInput.placeholder = 'Time';
            timeInput.value = setData ? (setData.time || '') : '';
            timeInput.id = `time-${dayIndex}-${exerciseIndex}-${setNum}`;
            timeInput.className = 'time-input';
            
            // Intensity input
            const intensityInput = document.createElement('input');
            intensityInput.type = 'text';
            intensityInput.placeholder = 'Intensity';
            intensityInput.value = setData ? (setData.intensity || '') : '';
            intensityInput.id = `intensity-${dayIndex}-${exerciseIndex}-${setNum}`;
            intensityInput.className = 'intensity-input';
            
            row.appendChild(timeInput);
            row.appendChild(intensityInput);
        } else {
            // Reps input
            const repsInput = document.createElement('input');
            repsInput.type = 'number';
            repsInput.placeholder = 'Reps';
            repsInput.value = setData ? (setData.reps || '') : '';
            repsInput.id = `reps-${dayIndex}-${exerciseIndex}-${setNum}`;
            
            // Weight input
            const weightInput = document.createElement('input');
            weightInput.type = 'number';
            weightInput.placeholder = 'Weight';
            weightInput.value = setData ? (setData.weight || '') : '';
            weightInput.id = `weight-${dayIndex}-${exerciseIndex}-${setNum}`;
            
            row.appendChild(repsInput);
            row.appendChild(weightInput);
        }
    }
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-exercise-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeExercise(dayIndex, exerciseIndex);
    row.appendChild(removeBtn);
    
    return row;
}

// Update exercise dropdowns based on selected focus areas
async function updateExerciseDropdowns(dayIndex) {
    const focusAreas = getSelectedFocusAreas(dayIndex);
    
    // If "none" is selected or no selection, clear exercises
    if (focusAreas.length === 0 || focusAreas[0] === 'none') {
        const container = document.getElementById(`exercise-rows-${dayIndex}`);
        const selects = container.querySelectorAll('.exercise-select');
        
        selects.forEach(select => {
            updateExerciseOptions(select, dayIndex, []);
        });
        return;
    }
    
    try {
        const response = await fetch('/api/exercises-for-focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ focusAreas })
        });
        
        const exercises = await response.json();
        
        // Update all exercise selects for this day
        const container = document.getElementById(`exercise-rows-${dayIndex}`);
        const selects = container.querySelectorAll('.exercise-select');
        
        selects.forEach(select => {
            const currentValue = select.value;
            updateExerciseOptions(select, dayIndex, exercises);
            if (exercises.includes(currentValue)) {
                select.value = currentValue;
            }
        });
        
        // If cardio is selected/deselected, recreate all exercise rows
        const isCardio = focusAreas.includes('cardio');
        const rows = container.querySelectorAll('.exercise-row');
        
        // Check if we need to recreate rows (when switching to/from cardio)
        if (rows.length > 0) {
            const firstRow = rows[0];
            const hasTimeInputs = firstRow.querySelector('.time-input') !== null;
            
            if ((isCardio && !hasTimeInputs) || (!isCardio && hasTimeInputs)) {
                // Recreate all rows with correct input types
                container.innerHTML = '';
                for (let i = 0; i < rows.length; i++) {
                    const newRow = createExerciseRow(dayIndex, i);
                    container.appendChild(newRow);
                }
                // Update dropdowns again after recreation
                updateExerciseDropdowns(dayIndex);
            }
        }
    } catch (error) {
        console.error('Failed to update exercises:', error);
    }
}

// Update exercise options in a select element
function updateExerciseOptions(select, dayIndex, exercises = null) {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Exercise</option>';
    
    if (exercises) {
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            select.appendChild(option);
        });
    }
}

// Get selected focus areas for a day
function getSelectedFocusAreas(dayIndex) {
    const radio = document.querySelector(
        `[data-day-index="${dayIndex}"] .focus-checkbox input:checked`
    );
    if (!radio || radio.value === 'none') {
        return [];
    }
    return [radio.value];
}

// Add exercise row
function addExercise(dayIndex) {
    const container = document.getElementById(`exercise-rows-${dayIndex}`);
    const exerciseCount = container.children.length;
    const row = createExerciseRow(dayIndex, exerciseCount);
    container.appendChild(row);
    updateExerciseDropdowns(dayIndex);
}

// Remove exercise row
function removeExercise(dayIndex, exerciseIndex) {
    const container = document.getElementById(`exercise-rows-${dayIndex}`);
    const row = container.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    if (row) {
        row.remove();
        // Re-index remaining exercises
        reindexExercises(dayIndex);
    }
}

// Re-index exercises after removal
function reindexExercises(dayIndex) {
    const container = document.getElementById(`exercise-rows-${dayIndex}`);
    const rows = container.querySelectorAll('.exercise-row');
    
    rows.forEach((row, index) => {
        row.dataset.exerciseIndex = index;
        // Update IDs
        const select = row.querySelector('.exercise-select');
        select.id = `exercise-${dayIndex}-${index}`;
        
        const inputs = row.querySelectorAll('input');
        inputs.forEach((input, inputIndex) => {
            const setNum = Math.floor(inputIndex / 2) + 1;
            const type = inputIndex % 2 === 0 ? 'reps' : 'weight';
            input.id = `${type}-${dayIndex}-${index}-${setNum}`;
        });
    });
}

// Create cardio and notes section
function createCardioNotesSection(day, dayIndex) {
    const section = document.createElement('div');
    section.className = 'cardio-notes-section';
    
    // Cardio
    const cardioDiv = document.createElement('div');
    cardioDiv.className = 'cardio-section';
    cardioDiv.innerHTML = `
        <h4>Cardio</h4>
        <textarea 
            id="cardio-${dayIndex}" 
            placeholder="Enter cardio activities..."
        >${day.cardio || ''}</textarea>
    `;
    
    // Notes
    const notesDiv = document.createElement('div');
    notesDiv.className = 'notes-section';
    notesDiv.innerHTML = `
        <h4>Notes</h4>
        <textarea 
            id="notes-${dayIndex}" 
            placeholder="Enter workout notes..."
        >${day.notes || ''}</textarea>
    `;
    
    section.appendChild(cardioDiv);
    section.appendChild(notesDiv);
    
    return section;
}

// Save week data
async function saveWeek(weekData) {
    try {
        // Collect all data
        const updatedWeek = {
            ...weekData,
            days: weekData.days.map((day, dayIndex) => ({
                ...day,
                focusAreas: getSelectedFocusAreas(dayIndex),
                exercises: collectExercises(dayIndex),
                cardio: document.getElementById(`cardio-${dayIndex}`).value,
                notes: document.getElementById(`notes-${dayIndex}`).value
            }))
        };
        
        const response = await fetch(`/api/week/${currentWeek}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedWeek)
        });
        
        if (response.ok) {
            alert('Week saved successfully!');
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        console.error('Failed to save week:', error);
        alert('Failed to save week data');
    }
}

// Collect exercises for a day
function collectExercises(dayIndex) {
    const container = document.getElementById(`exercise-rows-${dayIndex}`);
    const rows = container.querySelectorAll('.exercise-row');
    const focusAreas = getSelectedFocusAreas(dayIndex);
    const isCardio = focusAreas.includes('cardio');
    
    return Array.from(rows).map((row, exerciseIndex) => {
        const name = row.querySelector('.exercise-select').value;
        const sets = [];
        
        for (let setNum = 1; setNum <= 5; setNum++) {
            if (isCardio) {
                const timeInput = document.getElementById(`time-${dayIndex}-${exerciseIndex}-${setNum}`);
                const intensityInput = document.getElementById(`intensity-${dayIndex}-${exerciseIndex}-${setNum}`);
                sets.push({ 
                    time: timeInput ? timeInput.value : '', 
                    intensity: intensityInput ? intensityInput.value : '' 
                });
            } else {
                const repsInput = document.getElementById(`reps-${dayIndex}-${exerciseIndex}-${setNum}`);
                const weightInput = document.getElementById(`weight-${dayIndex}-${exerciseIndex}-${setNum}`);
                sets.push({ 
                    reps: repsInput ? repsInput.value : '', 
                    weight: weightInput ? weightInput.value : '' 
                });
            }
        }
        
        return { name, sets };
    }).filter(exercise => exercise.name); // Only include exercises with names
}

// Export week data
async function exportWeek() {
    try {
        const response = await fetch(`/api/export/week/${currentWeek}`);
        const weekData = await response.json();
        
        // Create downloadable file
        const dataStr = JSON.stringify(weekData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportName = `week-${currentWeek}-${weekData.startDate}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    } catch (error) {
        console.error('Failed to export week:', error);
        alert('Failed to export week data');
    }
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);