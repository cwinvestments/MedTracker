// MedTracker - Medication Reminder & Tracker
// localStorage keys
const MEDS_KEY = 'medtracker_medications';
const HISTORY_KEY = 'medtracker_history';
const SCHEDULE_KEY = 'medtracker_schedule';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadMedications();
    loadTodaySchedule();
    checkNotificationPermission();
    updateAdherenceStats();
    generatePreview();
    
    // Check for missed medications every minute
    setInterval(checkMissedMeds, 60000);
    
    // Update schedule every hour
    setInterval(loadTodaySchedule, 3600000);
});

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Set button active
    event.target.classList.add('active');
    
    // Refresh data when switching to specific tabs
    if (tabName === 'today') {
        loadTodaySchedule();
        updateAdherenceStats();
    } else if (tabName === 'medications') {
        loadMedications();
    } else if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'export') {
        generatePreview();
    }
}

// Switch add method
function switchAddMethod(method) {
    document.querySelectorAll('.add-method').forEach(m => {
        m.style.display = 'none';
    });
    
    if (method === 'form') {
        document.getElementById('add-form').style.display = 'block';
    } else {
        document.getElementById('add-bulk').style.display = 'block';
    }
    
    // Update tab buttons
    const tabs = document.querySelectorAll('#add-tab .tabs .tab-btn');
    tabs.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Update time inputs based on frequency
function updateTimeInputs() {
    const frequency = document.getElementById('med-frequency').value;
    const container = document.getElementById('time-inputs');
    container.innerHTML = '';
    
    let timeCount = 0;
    let defaultTimes = [];
    
    switch(frequency) {
        case 'once':
            timeCount = 1;
            defaultTimes = ['08:00'];
            break;
        case 'twice':
            timeCount = 2;
            defaultTimes = ['08:00', '20:00'];
            break;
        case 'three':
            timeCount = 3;
            defaultTimes = ['08:00', '14:00', '20:00'];
            break;
        case 'four':
            timeCount = 4;
            defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
            break;
        case 'custom':
            // Start with 1 input, allow adding more
            container.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <input type="time" class="time-input" value="08:00" required style="margin-right: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="addTimeInput()" style="padding: 8px 16px;">+ Add Time</button>
                </div>
            `;
            return;
    }
    
    for (let i = 0; i < timeCount; i++) {
        const input = document.createElement('input');
        input.type = 'time';
        input.className = 'time-input';
        input.value = defaultTimes[i] || '08:00';
        input.required = true;
        input.style.marginBottom = '10px';
        container.appendChild(input);
    }
}

function addTimeInput() {
    const container = document.getElementById('time-inputs');
    const newInput = document.createElement('div');
    newInput.style.marginBottom = '10px';
    newInput.innerHTML = `
        <input type="time" class="time-input" value="08:00" required style="margin-right: 10px;">
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 8px 16px;">Remove</button>
    `;
    container.appendChild(newInput);
}

// Add medication
function addMedication(event) {
    event.preventDefault();
    
    const times = Array.from(document.querySelectorAll('.time-input')).map(input => input.value);
    
    const medication = {
        id: Date.now(),
        name: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        frequency: document.getElementById('med-frequency').value,
        times: times,
        doctor: document.getElementById('med-doctor').value,
        purpose: document.getElementById('med-purpose').value,
        pharmacy: document.getElementById('med-pharmacy').value,
        addedDate: new Date().toISOString()
    };
    
    const meds = getMedications();
    meds.push(medication);
    saveMedications(meds);
    
    alert('✅ Medication added successfully!');
    clearForm();
    loadMedications();
    loadTodaySchedule();
    scheduleNotifications();
}

// Bulk add medications
function bulkAddMedications() {
    const bulkText = document.getElementById('bulk-paste').value.trim();
    if (!bulkText) {
        alert('Please paste medication data');
        return;
    }
    
    const lines = bulkText.split('\n').filter(line => line.trim());
    const meds = getMedications();
    let added = 0;
    
    lines.forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
            const times = parts[3] ? parts[3].split(',').map(t => {
                // Convert "8:00 AM" to "08:00" format
                return convertTo24Hour(t.trim());
            }) : ['08:00'];
            
            meds.push({
                id: Date.now() + added,
                name: parts[0],
                dosage: parts[1],
                frequency: parts[2],
                times: times,
                doctor: '',
                purpose: '',
                pharmacy: '',
                addedDate: new Date().toISOString()
            });
            added++;
        }
    });
    
    if (added > 0) {
        saveMedications(meds);
        alert(`✅ ${added} medication(s) added successfully!`);
        document.getElementById('bulk-paste').value = '';
        loadMedications();
        loadTodaySchedule();
        scheduleNotifications();
    } else {
        alert('No valid medications found. Please check format.');
    }
}

// Convert 12-hour to 24-hour format
function convertTo24Hour(time) {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return '08:00';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3] ? match[3].toUpperCase() : null;
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Clear form
function clearForm() {
    document.getElementById('medication-form').reset();
    document.getElementById('time-inputs').innerHTML = '';
}

// Load medications
function loadMedications() {
    const meds = getMedications();
    const container = document.getElementById('med-list');
    
    if (meds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💊</div>
                <h3>No medications added yet</h3>
                <p>Start by adding your first medication</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = meds.map(med => `
        <li class="med-item">
            <h3>${med.name}</h3>
            <div class="med-details">
                <strong>Dosage:</strong> ${med.dosage}<br>
                <strong>Frequency:</strong> ${med.frequency}<br>
                <strong>Times:</strong> ${med.times.map(t => formatTime(t)).join(', ')}<br>
                ${med.doctor ? `<strong>Doctor:</strong> ${med.doctor}<br>` : ''}
                ${med.purpose ? `<strong>Purpose:</strong> ${med.purpose}<br>` : ''}
                ${med.pharmacy ? `<strong>Pharmacy:</strong> ${med.pharmacy}<br>` : ''}
            </div>
            <div class="med-actions">
                <button class="btn btn-danger" onclick="deleteMedication(${med.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

// Delete medication
function deleteMedication(id) {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    let meds = getMedications();
    meds = meds.filter(m => m.id !== id);
    saveMedications(meds);
    loadMedications();
    loadTodaySchedule();
}

// Load today's schedule
function loadTodaySchedule() {
    const meds = getMedications();
    const today = new Date().toISOString().split('T')[0];
    const schedule = getTodaySchedule();
    
    const container = document.getElementById('today-schedule');
    
    if (meds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No medications scheduled for today</h3>
                <p>Add medications to see your daily schedule</p>
            </div>
        `;
        return;
    }
    
    // Generate schedule items
    let scheduleItems = [];
    meds.forEach(med => {
        med.times.forEach(time => {
            const scheduleId = `${today}-${med.id}-${time}`;
            const status = schedule[scheduleId] || 'pending';
            scheduleItems.push({
                id: scheduleId,
                time: time,
                med: med,
                status: status
            });
        });
    });
    
    // Sort by time
    scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
    
    container.innerHTML = scheduleItems.map(item => `
        <div class="schedule-item ${item.status}">
            <div>
                <div class="schedule-time">${formatTime(item.time)}</div>
                <div class="schedule-med-name">${item.med.name}</div>
                <div class="schedule-dosage">${item.med.dosage}</div>
            </div>
            <div>
                <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>
                ${item.status === 'pending' ? `
                    <button class="btn btn-success" style="margin-left: 10px; padding: 8px 16px;" onclick="markTaken('${item.id}')">✓ Taken</button>
                    <button class="btn btn-danger" style="padding: 8px 16px;" onclick="markMissed('${item.id}')">✗ Missed</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Mark medication as taken
function markTaken(scheduleId) {
    const schedule = getTodaySchedule();
    schedule[scheduleId] = 'taken';
    saveTodaySchedule(schedule);
    
    // Add to history
    addToHistory(scheduleId, 'taken');
    
    loadTodaySchedule();
    updateAdherenceStats();
}

// Mark medication as missed
function markMissed(scheduleId) {
    const schedule = getTodaySchedule();
    schedule[scheduleId] = 'missed';
    saveTodaySchedule(schedule);
    
    // Add to history
    addToHistory(scheduleId, 'missed');
    
    loadTodaySchedule();
    updateAdherenceStats();
}

// Check for missed medications
function checkMissedMeds() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    const schedule = getTodaySchedule();
    const meds = getMedications();
    
    meds.forEach(med => {
        med.times.forEach(time => {
            const scheduleId = `${today}-${med.id}-${time}`;
            if (!schedule[scheduleId] && time < currentTime) {
                // Auto-mark as missed if past time and not recorded
                schedule[scheduleId] = 'missed';
                addToHistory(scheduleId, 'missed');
            }
        });
    });
    
    saveTodaySchedule(schedule);
}

// Update adherence statistics
function updateAdherenceStats() {
    const history = getHistory();
    const today = new Date().toISOString().split('T')[0];
    
    // Today's count
    const todayRecords = history.filter(h => h.date === today && h.status === 'taken');
    document.getElementById('stat-today').textContent = todayRecords.length;
    
    // 7-day adherence
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekRecords = history.filter(h => new Date(h.timestamp) >= sevenDaysAgo);
    const weekTaken = weekRecords.filter(h => h.status === 'taken').length;
    const weekTotal = weekRecords.length;
    const weekPercent = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;
    document.getElementById('stat-week').textContent = weekPercent + '%';
    
    // Streak calculation
    let streak = 0;
    const sortedDates = [...new Set(history.map(h => h.date))].sort().reverse();
    for (let date of sortedDates) {
        const dayRecords = history.filter(h => h.date === date);
        const allTaken = dayRecords.every(h => h.status === 'taken');
        if (allTaken && dayRecords.length > 0) {
            streak++;
        } else {
            break;
        }
    }
    document.getElementById('stat-streak').textContent = streak;
}

// Load history
function loadHistory() {
    const history = getHistory();
    const container = document.getElementById('history-list');
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No history yet</h3>
                <p>Your medication tracking history will appear here</p>
            </div>
        `;
        return;
    }
    
    // Group by date
    const byDate = {};
    history.forEach(record => {
        if (!byDate[record.date]) byDate[record.date] = [];
        byDate[record.date].push(record);
    });
    
    container.innerHTML = Object.keys(byDate).sort().reverse().map(date => `
        <div style="margin-bottom: 30px;">
            <h3>${formatDate(date)}</h3>
            ${byDate[date].map(record => `
                <div class="schedule-item ${record.status}" style="margin-bottom: 10px;">
                    <div>
                        <div class="schedule-med-name">${record.medName}</div>
                        <div class="schedule-dosage">${record.dosage} at ${formatTime(record.time)}</div>
                        <div style="font-size: 0.9em; color: #999;">Recorded: ${new Date(record.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <span class="status-badge status-${record.status}">${record.status.toUpperCase()}</span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Print medication list
function printMedList() {
    window.print();
}

// Copy to clipboard
function copyToClipboard() {
    const meds = getMedications();
    let text = 'MY MEDICATION LIST\n';
    text += '='.repeat(50) + '\n\n';
    
    meds.forEach((med, index) => {
        text += `${index + 1}. ${med.name}\n`;
        text += `   Dosage: ${med.dosage}\n`;
        text += `   Frequency: ${med.frequency}\n`;
        text += `   Times: ${med.times.map(t => formatTime(t)).join(', ')}\n`;
        if (med.doctor) text += `   Doctor: ${med.doctor}\n`;
        if (med.purpose) text += `   Purpose: ${med.purpose}\n`;
        if (med.pharmacy) text += `   Pharmacy: ${med.pharmacy}\n`;
        text += '\n';
    });
    
    text += `Generated: ${new Date().toLocaleString()}\n`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Medication list copied to clipboard!');
    });
}

// Export to PDF (simplified - uses browser print to PDF)
function exportToPDF() {
    alert('Use your browser\'s "Print to PDF" feature:\n\n1. Click OK\n2. Select "Print"\n3. Choose "Save as PDF" as the destination\n4. Click "Save"');
    window.print();
}

// Generate preview
function generatePreview() {
    const meds = getMedications();
    const container = document.getElementById('preview-content');
    
    if (meds.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No medications to display</p>';
        return;
    }
    
    let html = '<h2 style="text-align: center;">My Medication List</h2>';
    html += '<p style="text-align: center; color: #666; margin-bottom: 30px;">Generated: ' + new Date().toLocaleDateString() + '</p>';
    
    meds.forEach((med, index) => {
        html += `
            <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
                <h3 style="color: #333; margin-bottom: 10px;">${index + 1}. ${med.name}</h3>
                <p style="margin: 5px 0;"><strong>Dosage:</strong> ${med.dosage}</p>
                <p style="margin: 5px 0;"><strong>Frequency:</strong> ${med.frequency}</p>
                <p style="margin: 5px 0;"><strong>Times:</strong> ${med.times.map(t => formatTime(t)).join(', ')}</p>
                ${med.doctor ? `<p style="margin: 5px 0;"><strong>Doctor:</strong> ${med.doctor}</p>` : ''}
                ${med.purpose ? `<p style="margin: 5px 0;"><strong>Purpose:</strong> ${med.purpose}</p>` : ''}
                ${med.pharmacy ? `<p style="margin: 5px 0;"><strong>Pharmacy:</strong> ${med.pharmacy}</p>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Notification handling
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        document.getElementById('notification-status').style.display = 'none';
        return;
    }
    
    if (Notification.permission === 'default') {
        document.getElementById('notification-status').style.display = 'block';
    } else if (Notification.permission === 'denied') {
        document.getElementById('notification-status').innerHTML = `
            <strong>⚠️ Notifications Blocked</strong>
            <p>Please enable notifications in your browser settings to receive medication reminders.</p>
        `;
        document.getElementById('notification-status').style.display = 'block';
    } else {
        document.getElementById('notification-status').style.display = 'none';
        scheduleNotifications();
    }
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Your browser does not support notifications');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('✅ Notifications enabled!');
            document.getElementById('notification-status').style.display = 'none';
            scheduleNotifications();
        }
    });
}

function scheduleNotifications() {
    if (Notification.permission !== 'granted') return;
    
    // Check every minute for upcoming medications
    setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const today = now.toISOString().split('T')[0];
        const meds = getMedications();
        const schedule = getTodaySchedule();
        
        meds.forEach(med => {
            med.times.forEach(time => {
                const scheduleId = `${today}-${med.id}-${time}`;
                if (time === currentTime && !schedule[scheduleId]) {
                    new Notification('💊 Medication Reminder', {
                        body: `Time to take ${med.name} (${med.dosage})`,
                        icon: '/icon-192.png',
                        requireInteraction: true
                    });
                }
            });
        });
    }, 60000);
}

// Utility functions
function getMedications() {
    return JSON.parse(localStorage.getItem(MEDS_KEY) || '[]');
}

function saveMedications(meds) {
    localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
}

function getTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const allSchedules = JSON.parse(localStorage.getItem(SCHEDULE_KEY) || '{}');
    return allSchedules[today] || {};
}

function saveTodaySchedule(schedule) {
    const today = new Date().toISOString().split('T')[0];
    const allSchedules = JSON.parse(localStorage.getItem(SCHEDULE_KEY) || '{}');
    allSchedules[today] = schedule;
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(allSchedules));
}

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(scheduleId, status) {
    const [date, medId, time] = scheduleId.split('-');
    const meds = getMedications();
    const med = meds.find(m => m.id == medId);
    
    if (!med) return;
    
    const history = getHistory();
    history.push({
        date: date,
        medId: medId,
        medName: med.name,
        dosage: med.dosage,
        time: time,
        status: status,
        timestamp: new Date().toISOString()
    });
    saveHistory(history);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
