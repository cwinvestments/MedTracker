// MedTracker with Supabase Authentication
// Initialize Supabase
const SUPABASE_URL = 'https://rvcaaieoqbnlbrchltoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Y2FhaWVvcWJubGJyY2hsdG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjA3NzYsImV4cCI6MjA3NzU5Njc3Nn0.3tdHpwP0TYr8Hh4weeF-igYt-_cRkBmYr-cRjQrYb2I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
});

// Check authentication status
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showApp();
        await loadAllData();
    } else {
        showAuth();
    }
    
    document.getElementById('loading-screen').style.display = 'none';
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showApp();
            loadAllData();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuth();
        }
    });
}

// Show authentication screen
function showAuth() {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('app-container').style.display = 'none';
}

// Show main app
function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('user-email-display').textContent = currentUser.email;
    loadDarkModePreference();
}

// Switch auth tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
    
    document.getElementById('auth-message').innerHTML = '';
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        showAuthMessage(error.message, 'error');
    } else {
        showAuthMessage('Logged in successfully!', 'success');
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    const { data, error} = await supabase.auth.signUp({
        email: email,
        password: password
    });
    
    if (error) {
        showAuthMessage(error.message, 'error');
    } else {
        showAuthMessage('Account created! Please check your email to verify your account.', 'success');
    }
}

// Handle logout
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Error signing out: ' + error.message);
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const btn = document.querySelector('.dark-mode-toggle');
    btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Load dark mode preference
function loadDarkModePreference() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.dark-mode-toggle');
        if (btn) btn.textContent = '☀️ Light Mode';
    }
}

// Show auth message
function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('auth-message');
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// Show app message
function showAppMessage(message, type, elementId = 'add-message') {
    const messageDiv = document.getElementById(elementId);
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Load all data
async function loadAllData() {
    await loadMedications();
    await loadTodaySchedule();
    await updateAdherenceStats();
    await generatePreview();
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'today') {
        loadTodaySchedule();
        updateAdherenceStats();
    } else if (tabName === 'medications') {
        loadMedications();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    } else if (tabName === 'journal') {
        loadJournal();
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
async function addMedication(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    const times = Array.from(document.querySelectorAll('.time-input')).map(input => input.value);
    
    const medication = {
        user_id: currentUser.id,
        name: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        category: document.getElementById('med-category').value,
        frequency: document.getElementById('med-frequency').value,
        times: times,
        doctor: document.getElementById('med-doctor').value || null,
        purpose: document.getElementById('med-purpose').value || null,
        pharmacy: document.getElementById('med-pharmacy').value || null,
        pills_remaining: document.getElementById('med-pills-remaining').value || null,
        total_pills: document.getElementById('med-total-pills').value || null,
        refill_by_date: document.getElementById('med-refill-date').value || null,
        cost_per_refill: document.getElementById('med-cost').value || null,
        notes: document.getElementById('med-notes').value || null
    };
    
    let result;
    
    if (editId) {
        // Update existing medication
        result = await supabase
            .from('medications')
            .update(medication)
            .eq('id', editId)
            .eq('user_id', currentUser.id)
            .select();
    } else {
        // Insert new medication
        result = await supabase
            .from('medications')
            .insert([medication])
            .select();
    }
    
    const { data, error } = result;
    
    if (error) {
        showAppMessage('Error saving medication: ' + error.message, 'error');
    } else {
        showAppMessage(editId ? '✅ Medication updated successfully!' : '✅ Medication added successfully!', 'success');
        clearForm();
        loadMedications();
        loadTodaySchedule();
    }
}

// Bulk add medications
async function bulkAddMedications() {
    const bulkText = document.getElementById('bulk-paste').value.trim();
    if (!bulkText) {
        showAppMessage('Please paste medication data', 'error');
        return;
    }
    
    const lines = bulkText.split('\n').filter(line => line.trim());
    const medications = [];
    
    lines.forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
            const times = parts[3] ? parts[3].split(',').map(t => convertTo24Hour(t.trim())) : ['08:00'];
            
            medications.push({
                user_id: currentUser.id,
                name: parts[0],
                dosage: parts[1],
                category: 'prescribed', // Default category for bulk imports
                frequency: parts[2],
                times: times,
                doctor: null,
                purpose: null,
                pharmacy: null
            });
        }
    });
    
    if (medications.length > 0) {
        const { data, error } = await supabase
            .from('medications')
            .insert(medications)
            .select();
        
        if (error) {
            showAppMessage('Error importing medications: ' + error.message, 'error');
        } else {
            showAppMessage(`✅ ${medications.length} medication(s) added successfully!`, 'success');
            document.getElementById('bulk-paste').value = '';
            loadMedications();
            loadTodaySchedule();
        }
    } else {
        showAppMessage('No valid medications found. Please check format.', 'error');
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
    const form = document.getElementById('medication-form');
    form.reset();
    document.getElementById('time-inputs').innerHTML = '';
    
    // Reset edit mode
    delete form.dataset.editId;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Add Medication';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-primary');
}

// Load medications
async function loadMedications() {
    const filterValue = document.getElementById('category-filter') ? document.getElementById('category-filter').value : 'all';
    const searchValue = document.getElementById('med-search') ? document.getElementById('med-search').value.toLowerCase() : '';
    
    const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('category', { ascending: true })
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('med-list');
    
    if (error || !medications || medications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💊</div>
                <h3>No medications added yet</h3>
                <p>Start by adding your first medication</p>
            </div>
        `;
        return;
    }
    
    // Filter medications by category and search
    let filteredMeds = filterValue === 'all' 
        ? medications 
        : medications.filter(med => med.category === filterValue);
    
    // Apply search filter
    if (searchValue) {
        filteredMeds = filteredMeds.filter(med => 
            med.name.toLowerCase().includes(searchValue) ||
            (med.doctor && med.doctor.toLowerCase().includes(searchValue)) ||
            (med.purpose && med.purpose.toLowerCase().includes(searchValue))
        );
    }
    
    if (filteredMeds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💊</div>
                <h3>No medications found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }
    
    // Group by category
    const categories = {
        prescribed: { name: '💊 Prescribed Medications', meds: [] },
        supplements: { name: '🌿 Vitamins & Supplements', meds: [] },
        otc: { name: '🏥 Over-the-Counter', meds: [] },
        injections: { name: '💉 Injections', meds: [] }
    };
    
    filteredMeds.forEach(med => {
        const category = med.category || 'prescribed';
        if (categories[category]) {
            categories[category].meds.push(med);
        }
    });
    
    let html = '';
    
    // Display each category that has medications
    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        if (cat.meds.length > 0) {
            html += `<h3 style="margin-top: 20px; margin-bottom: 15px; color: var(--text-primary);">${cat.name}</h3>`;
            html += cat.meds.map(med => {
                // Calculate refill warning
                let refillWarning = '';
                if (med.pills_remaining !== null && med.refill_by_date) {
                    const today = new Date();
                    const refillDate = new Date(med.refill_by_date);
                    const daysUntil = Math.ceil((refillDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (med.pills_remaining <= 5) {
                        refillWarning = `<div class="refill-critical">⚠️ CRITICAL: Only ${med.pills_remaining} pills remaining!</div>`;
                    } else if (med.pills_remaining <= 15 || daysUntil <= 7) {
                        refillWarning = `<div class="refill-warning">⚠️ Low supply: ${med.pills_remaining} pills remaining. Refill by ${formatRefillDate(med.refill_by_date)}</div>`;
                    }
                }
                
                return `
                <li class="med-item">
                    <h3>
                        ${med.name}
                        <span class="category-badge category-${med.category || 'prescribed'}">${getCategoryLabel(med.category)}</span>
                    </h3>
                    <div class="med-details">
                        <strong>Dosage:</strong> ${med.dosage}<br>
                        <strong>Frequency:</strong> ${med.frequency}<br>
                        <strong>Times:</strong> ${med.times.map(t => formatTime(t)).join(', ')}<br>
                        ${med.doctor ? `<strong>Doctor:</strong> ${med.doctor}<br>` : ''}
                        ${med.purpose ? `<strong>Purpose:</strong> ${med.purpose}<br>` : ''}
                        ${med.pharmacy ? `<strong>Pharmacy:</strong> ${med.pharmacy}<br>` : ''}
                        ${med.pills_remaining !== null ? `<strong>Pills Remaining:</strong> ${med.pills_remaining}${med.total_pills ? ` / ${med.total_pills}` : ''}<br>` : ''}
                        ${med.refill_by_date ? `<strong>Refill By:</strong> ${formatRefillDate(med.refill_by_date)}<br>` : ''}
                        ${med.cost_per_refill ? `<strong>Cost per Refill:</strong> $${parseFloat(med.cost_per_refill).toFixed(2)}<br>` : ''}
                        ${med.notes ? `<strong>Notes:</strong> ${med.notes}<br>` : ''}
                    </div>
                    ${refillWarning}
                    <div class="med-actions">
                        <button class="btn btn-primary" onclick="editMedication('${med.id}')">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteMedication('${med.id}')">Delete</button>
                    </div>
                </li>
            `;
            }).join('');
        }
    });
    
    container.innerHTML = html;
}

// Format refill date
function formatRefillDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        prescribed: 'Prescribed',
        supplements: 'Supplement',
        otc: 'OTC',
        injections: 'Injection'
    };
    return labels[category] || 'Prescribed';
}

// Delete medication
async function deleteMedication(id) {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    if (error) {
        alert('Error deleting medication: ' + error.message);
    } else {
        loadMedications();
        loadTodaySchedule();
    }
}

// Edit medication
async function editMedication(id) {
    // Get the medication data
    const { data: med, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .single();
    
    if (error || !med) {
        alert('Error loading medication: ' + (error?.message || 'Not found'));
        return;
    }
    
    // Switch to Add tab and wait for it to render
    const addTabBtn = document.querySelectorAll('.tab-btn')[2]; // Add Medication is 3rd tab
    addTabBtn.click();
    
    // Wait a moment for tab to switch
    setTimeout(() => {
        // Populate the form
        document.getElementById('med-name').value = med.name;
        document.getElementById('med-dosage').value = med.dosage;
        document.getElementById('med-category').value = med.category || 'prescribed';
        document.getElementById('med-frequency').value = med.frequency;
        document.getElementById('med-doctor').value = med.doctor || '';
        document.getElementById('med-purpose').value = med.purpose || '';
        document.getElementById('med-pharmacy').value = med.pharmacy || '';
        document.getElementById('med-pills-remaining').value = med.pills_remaining || '';
        document.getElementById('med-total-pills').value = med.total_pills || '';
        document.getElementById('med-refill-date').value = med.refill_by_date || '';
        document.getElementById('med-cost').value = med.cost_per_refill || '';
        document.getElementById('med-notes').value = med.notes || '';
        
        // Trigger frequency change to populate time inputs
        updateTimeInputs();
        
        // Set the times after time inputs are created
        setTimeout(() => {
            const timeInputs = document.querySelectorAll('.time-input');
            med.times.forEach((time, index) => {
                if (timeInputs[index]) {
                    timeInputs[index].value = time;
                }
            });
        }, 200);
        
        // Change form to update mode
        const form = document.getElementById('medication-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Update Medication';
        submitBtn.classList.add('btn-success');
        submitBtn.classList.remove('btn-primary');
        
        // Store the ID for updating
        form.dataset.editId = id;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

// Load today's schedule
async function loadTodaySchedule() {
    const filterValue = document.getElementById('today-category-filter') ? document.getElementById('today-category-filter').value : 'all';
    
    const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id);
    
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('today-schedule');
    
    if (error || !medications || medications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No medications scheduled for today</h3>
                <p>Add medications to see your daily schedule</p>
            </div>
        `;
        return;
    }
    
    // Filter by category if needed
    const filteredMeds = filterValue === 'all' 
        ? medications 
        : medications.filter(med => med.category === filterValue);
    
    if (filteredMeds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No medications in this category</h3>
                <p>Try selecting a different category</p>
            </div>
        `;
        return;
    }
    
    // Get today's logs
    const { data: logs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('scheduled_date', today);
    
    const logMap = {};
    if (logs) {
        logs.forEach(log => {
            const key = `${log.medication_id}-${log.scheduled_time}`;
            logMap[key] = log.status;
        });
    }
    
    // Generate schedule items
    let scheduleItems = [];
    filteredMeds.forEach(med => {
        med.times.forEach(time => {
            const key = `${med.id}-${time}`;
            const status = logMap[key] || 'pending';
            scheduleItems.push({
                medId: med.id,
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
                    <button class="btn btn-success" style="margin-left: 10px; padding: 8px 16px;" onclick="markTaken('${item.medId}', '${item.time}', '${item.med.name}', '${item.med.dosage}')">✓ Taken</button>
                    <button class="btn btn-danger" style="padding: 8px 16px;" onclick="markMissed('${item.medId}', '${item.time}', '${item.med.name}', '${item.med.dosage}')">✗ Missed</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Mark medication as taken
async function markTaken(medId, time, medName, dosage) {
    const today = new Date().toISOString().split('T')[0];
    
    const log = {
        user_id: currentUser.id,
        medication_id: medId,
        medication_name: medName,
        dosage: dosage,
        scheduled_date: today,
        scheduled_time: time,
        status: 'taken'
    };
    
    const { error } = await supabase
        .from('medication_logs')
        .insert([log]);
    
    if (error) {
        alert('Error recording medication: ' + error.message);
    } else {
        loadTodaySchedule();
        updateAdherenceStats();
    }
}

// Mark medication as missed
async function markMissed(medId, time, medName, dosage) {
    const today = new Date().toISOString().split('T')[0];
    
    const log = {
        user_id: currentUser.id,
        medication_id: medId,
        medication_name: medName,
        dosage: dosage,
        scheduled_date: today,
        scheduled_time: time,
        status: 'missed'
    };
    
    const { error } = await supabase
        .from('medication_logs')
        .insert([log]);
    
    if (error) {
        alert('Error recording medication: ' + error.message);
    } else {
        loadTodaySchedule();
        updateAdherenceStats();
    }
}

// Update adherence statistics
async function updateAdherenceStats() {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Today's count
    const { data: todayLogs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('scheduled_date', today)
        .eq('status', 'taken');
    
    document.getElementById('stat-today').textContent = todayLogs ? todayLogs.length : 0;
    
    // 7-day adherence
    const { data: weekLogs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('scheduled_date', sevenDaysAgo.toISOString().split('T')[0]);
    
    if (weekLogs && weekLogs.length > 0) {
        const takenCount = weekLogs.filter(log => log.status === 'taken').length;
        const percentage = Math.round((takenCount / weekLogs.length) * 100);
        document.getElementById('stat-week').textContent = percentage + '%';
    } else {
        document.getElementById('stat-week').textContent = '0%';
    }
    
    // Streak calculation
    const { data: allLogs } = await supabase
        .from('medication_logs')
        .select('scheduled_date, status')
        .eq('user_id', currentUser.id)
        .order('scheduled_date', { ascending: false });
    
    let streak = 0;
    if (allLogs) {
        const uniqueDates = [...new Set(allLogs.map(log => log.scheduled_date))];
        for (let date of uniqueDates) {
            const dayLogs = allLogs.filter(log => log.scheduled_date === date);
            const allTaken = dayLogs.every(log => log.status === 'taken');
            if (allTaken && dayLogs.length > 0) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    document.getElementById('stat-streak').textContent = streak;
}

// Load history
async function loadHistory() {
    const { data: logs, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });
    
    const container = document.getElementById('history-list');
    
    if (error || !logs || logs.length === 0) {
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
    logs.forEach(record => {
        if (!byDate[record.scheduled_date]) byDate[record.scheduled_date] = [];
        byDate[record.scheduled_date].push(record);
    });
    
    container.innerHTML = Object.keys(byDate).map(date => `
        <div style="margin-bottom: 30px;">
            <h3>${formatDate(date)}</h3>
            ${byDate[date].map(record => `
                <div class="schedule-item ${record.status}" style="margin-bottom: 10px;">
                    <div>
                        <div class="schedule-med-name">${record.medication_name}</div>
                        <div class="schedule-dosage">${record.dosage} at ${formatTime(record.scheduled_time)}</div>
                        <div style="font-size: 0.9em; color: #999;">Recorded: ${new Date(record.recorded_at).toLocaleTimeString()}</div>
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
async function copyToClipboard() {
    const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('category', { ascending: true });
    
    if (!medications || medications.length === 0) {
        alert('No medications to copy');
        return;
    }
    
    let text = 'MY MEDICATION LIST\n';
    text += '='.repeat(50) + '\n\n';
    
    // Group by category
    const categories = {
        prescribed: { name: 'PRESCRIBED MEDICATIONS', meds: [] },
        supplements: { name: 'VITAMINS & SUPPLEMENTS', meds: [] },
        otc: { name: 'OVER-THE-COUNTER', meds: [] },
        injections: { name: 'INJECTIONS', meds: [] }
    };
    
    medications.forEach(med => {
        const category = med.category || 'prescribed';
        if (categories[category]) {
            categories[category].meds.push(med);
        }
    });
    
    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        if (cat.meds.length > 0) {
            text += `\n${cat.name}\n`;
            text += '-'.repeat(cat.name.length) + '\n\n';
            cat.meds.forEach((med, index) => {
                text += `${index + 1}. ${med.name}\n`;
                text += `   Dosage: ${med.dosage}\n`;
                text += `   Frequency: ${med.frequency}\n`;
                text += `   Times: ${med.times.map(t => formatTime(t)).join(', ')}\n`;
                if (med.doctor) text += `   Doctor: ${med.doctor}\n`;
                if (med.purpose) text += `   Purpose: ${med.purpose}\n`;
                if (med.pharmacy) text += `   Pharmacy: ${med.pharmacy}\n`;
                if (med.pills_remaining !== null) text += `   Pills Remaining: ${med.pills_remaining}${med.total_pills ? ` / ${med.total_pills}` : ''}\n`;
                if (med.refill_by_date) text += `   Refill By: ${formatRefillDate(med.refill_by_date)}\n`;
                if (med.cost_per_refill) text += `   Cost: $${parseFloat(med.cost_per_refill).toFixed(2)}\n`;
                if (med.notes) text += `   Notes: ${med.notes}\n`;
                text += '\n';
            });
        }
    });
    
    text += `\nGenerated: ${new Date().toLocaleString()}\n`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Medication list copied to clipboard!');
    });
}

// Generate preview
async function generatePreview() {
    const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('category', { ascending: true });
    
    const container = document.getElementById('preview-content');
    
    if (!medications || medications.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No medications to display</p>';
        return;
    }
    
    let html = '<h2 style="text-align: center;">My Medication List</h2>';
    html += '<p style="text-align: center; opacity: 0.8; margin-bottom: 30px;">Generated: ' + new Date().toLocaleDateString() + '</p>';
    
    // Group by category for print view
    const categories = {
        prescribed: { name: '💊 Prescribed Medications', meds: [] },
        supplements: { name: '🌿 Vitamins & Supplements', meds: [] },
        otc: { name: '🏥 Over-the-Counter', meds: [] },
        injections: { name: '💉 Injections', meds: [] }
    };
    
    medications.forEach(med => {
        const category = med.category || 'prescribed';
        if (categories[category]) {
            categories[category].meds.push(med);
        }
    });
    
    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        if (cat.meds.length > 0) {
            html += `<h3 style="margin-top: 30px; margin-bottom: 15px;">${cat.name}</h3>`;
            cat.meds.forEach((med, index) => {
                html += `
                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 8px;">${med.name}</h4>
                        <p style="margin: 3px 0;"><strong>Dosage:</strong> ${med.dosage}</p>
                        <p style="margin: 3px 0;"><strong>Frequency:</strong> ${med.frequency}</p>
                        <p style="margin: 3px 0;"><strong>Times:</strong> ${med.times.map(t => formatTime(t)).join(', ')}</p>
                        ${med.doctor ? `<p style="margin: 3px 0;"><strong>Doctor:</strong> ${med.doctor}</p>` : ''}
                        ${med.purpose ? `<p style="margin: 3px 0;"><strong>Purpose:</strong> ${med.purpose}</p>` : ''}
                        ${med.pharmacy ? `<p style="margin: 3px 0;"><strong>Pharmacy:</strong> ${med.pharmacy}</p>` : ''}
                        ${med.pills_remaining !== null ? `<p style="margin: 3px 0;"><strong>Pills Remaining:</strong> ${med.pills_remaining}${med.total_pills ? ` / ${med.total_pills}` : ''}</p>` : ''}
                        ${med.refill_by_date ? `<p style="margin: 3px 0;"><strong>Refill By:</strong> ${formatRefillDate(med.refill_by_date)}</p>` : ''}
                        ${med.cost_per_refill ? `<p style="margin: 3px 0;"><strong>Cost:</strong> $${parseFloat(med.cost_per_refill).toFixed(2)}</p>` : ''}
                        ${med.notes ? `<p style="margin: 3px 0;"><strong>Notes:</strong> ${med.notes}</p>` : ''}
                    </div>
                `;
            });
        }
    });
    
    container.innerHTML = html;
}

// Utility functions
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

// Analytics Functions
let adherenceTrendChart = null;
let categoryDistributionChart = null;
let costByCategoryChart = null;

async function loadAnalytics() {
    await loadRefillAlerts();
    await loadCostAnalytics();
    await loadAdherenceTrend(30);
    await loadCategoryDistribution();
    await loadTimeAnalysis();
}

// Load refill alerts
async function loadRefillAlerts() {
    const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id)
        .not('pills_remaining', 'is', null);
    
    const container = document.getElementById('refill-alerts');
    
    if (!medications || medications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💊</div>
                <h3>No refill tracking</h3>
                <p>Add pill counts to medications to track refills</p>
            </div>
        `;
        return;
    }
    
    const today = new Date();
    const alerts = [];
    
    medications.forEach(med => {
        if (med.pills_remaining !== null) {
            let alertLevel = 'ok';
            let message = '';
            
            if (med.pills_remaining <= 5) {
                alertLevel = 'critical';
                message = `CRITICAL: Only ${med.pills_remaining} pills remaining!`;
            } else if (med.pills_remaining <= 15) {
                alertLevel = 'warning';
                message = `Low: ${med.pills_remaining} pills remaining`;
            }
            
            if (med.refill_by_date) {
                const refillDate = new Date(med.refill_by_date);
                const daysUntil = Math.ceil((refillDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntil <= 3 && daysUntil >= 0) {
                    alertLevel = alertLevel === 'critical' ? 'critical' : 'warning';
                    message += ` - Refill in ${daysUntil} days!`;
                } else if (daysUntil < 0) {
                    alertLevel = 'critical';
                    message = `OVERDUE: Refill was ${Math.abs(daysUntil)} days ago!`;
                }
            }
            
            if (alertLevel !== 'ok') {
                alerts.push({
                    med: med,
                    level: alertLevel,
                    message: message
                });
            }
        }
    });
    
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>All good!</h3>
                <p>No refills needed at this time</p>
            </div>
        `;
        return;
    }
    
    alerts.sort((a, b) => {
        if (a.level === 'critical' && b.level !== 'critical') return -1;
        if (a.level !== 'critical' && b.level === 'critical') return 1;
        return 0;
    });
    
    container.innerHTML = alerts.map(alert => `
        <div class="refill-${alert.level}" style="padding: 15px; margin-bottom: 10px; border-radius: 8px;">
            <strong>${alert.med.name}</strong> (${alert.med.dosage})<br>
            ${alert.message}
        </div>
    `).join('');
}

// Load cost analytics
async function loadCostAnalytics() {
    const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', currentUser.id)
        .not('cost_per_refill', 'is', null);
    
    if (!medications || medications.length === 0) {
        document.getElementById('total-monthly-cost').textContent = '$0';
        document.getElementById('total-yearly-cost').textContent = '$0';
        document.getElementById('most-expensive').textContent = '--';
        return;
    }
    
    // Calculate estimated monthly and yearly costs
    let totalMonthly = 0;
    let mostExpensive = { name: '--', cost: 0 };
    const categoryTotals = {
        prescribed: 0,
        supplements: 0,
        otc: 0,
        injections: 0
    };
    
    medications.forEach(med => {
        const cost = parseFloat(med.cost_per_refill) || 0;
        
        // Estimate monthly cost (assuming 30-day supply on average)
        const monthlyForThis = cost * (30 / (med.total_pills || 30));
        totalMonthly += monthlyForThis;
        
        if (cost > mostExpensive.cost) {
            mostExpensive = { name: med.name, cost: cost };
        }
        
        const category = med.category || 'prescribed';
        if (categoryTotals[category] !== undefined) {
            categoryTotals[category] += cost;
        }
    });
    
    document.getElementById('total-monthly-cost').textContent = '$' + totalMonthly.toFixed(2);
    document.getElementById('total-yearly-cost').textContent = '$' + (totalMonthly * 12).toFixed(2);
    document.getElementById('most-expensive').textContent = mostExpensive.name;
    
    // Create cost by category chart
    const ctx = document.getElementById('cost-by-category-chart');
    if (ctx) {
        if (costByCategoryChart) {
            costByCategoryChart.destroy();
        }
        
        const hasData = Object.values(categoryTotals).some(v => v > 0);
        if (hasData) {
            costByCategoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['💊 Prescribed', '🌿 Supplements', '🏥 OTC', '💉 Injections'],
                    datasets: [{
                        data: [
                            categoryTotals.prescribed,
                            categoryTotals.supplements,
                            categoryTotals.otc,
                            categoryTotals.injections
                        ],
                        backgroundColor: [
                            '#7e22ce',
                            '#10b981',
                            '#3b82f6',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.parsed.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

// Load adherence trend
async function loadAdherenceTrend(days = 30) {
    // Update button states
    const buttons = document.querySelectorAll('#analytics-tab .btn-secondary');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(days + ' Days')) {
            btn.classList.add('active');
        }
    });
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: logs } = await supabase
        .from('medication_logs')
        .select('scheduled_date, status')
        .eq('user_id', currentUser.id)
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });
    
    const ctx = document.getElementById('adherence-trend-chart');
    if (!ctx) return;
    
    // Aggregate by date
    const dateMap = {};
    if (logs) {
        logs.forEach(log => {
            if (!dateMap[log.scheduled_date]) {
                dateMap[log.scheduled_date] = { taken: 0, missed: 0, total: 0 };
            }
            dateMap[log.scheduled_date].total++;
            if (log.status === 'taken') {
                dateMap[log.scheduled_date].taken++;
            } else if (log.status === 'missed') {
                dateMap[log.scheduled_date].missed++;
            }
        });
    }
    
    // Generate labels and data
    const labels = [];
    const adherenceData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        if (dateMap[dateStr]) {
            const percentage = dateMap[dateStr].total > 0 
                ? (dateMap[dateStr].taken / dateMap[dateStr].total) * 100 
                : 0;
            adherenceData.push(percentage.toFixed(1));
        } else {
            adherenceData.push(null);
        }
    }
    
    if (adherenceTrendChart) {
        adherenceTrendChart.destroy();
    }
    
    adherenceTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Adherence %',
                data: adherenceData,
                borderColor: '#7e22ce',
                backgroundColor: 'rgba(126, 34, 206, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y !== null ? context.parsed.y + '%' : 'No data';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                    }
                }
            }
        }
    });
}

// Load category distribution
async function loadCategoryDistribution() {
    const { data: medications } = await supabase
        .from('medications')
        .select('category')
        .eq('user_id', currentUser.id);
    
    const ctx = document.getElementById('category-distribution-chart');
    if (!ctx) return;
    
    if (!medications || medications.length === 0) {
        return;
    }
    
    const counts = {
        prescribed: 0,
        supplements: 0,
        otc: 0,
        injections: 0
    };
    
    medications.forEach(med => {
        const category = med.category || 'prescribed';
        if (counts[category] !== undefined) {
            counts[category]++;
        }
    });
    
    if (categoryDistributionChart) {
        categoryDistributionChart.destroy();
    }
    
    categoryDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['💊 Prescribed', '🌿 Supplements', '🏥 OTC', '💉 Injections'],
            datasets: [{
                data: [
                    counts.prescribed,
                    counts.supplements,
                    counts.otc,
                    counts.injections
                ],
                backgroundColor: [
                    '#7e22ce',
                    '#10b981',
                    '#3b82f6',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
                    }
                }
            }
        }
    });
}

// Load time analysis
async function loadTimeAnalysis() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: logs } = await supabase
        .from('medication_logs')
        .select('scheduled_time, status')
        .eq('user_id', currentUser.id)
        .gte('scheduled_date', sevenDaysAgo.toISOString().split('T')[0]);
    
    const container = document.getElementById('time-analysis');
    
    if (!logs || logs.length < 10) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏰</div>
                <h3>Need more data</h3>
                <p>Track medications for at least 7 days to see time analysis</p>
            </div>
        `;
        return;
    }
    
    // Analyze adherence by time
    const timeStats = {};
    logs.forEach(log => {
        if (!timeStats[log.scheduled_time]) {
            timeStats[log.scheduled_time] = { taken: 0, missed: 0, total: 0 };
        }
        timeStats[log.scheduled_time].total++;
        if (log.status === 'taken') {
            timeStats[log.scheduled_time].taken++;
        }
    });
    
    // Calculate percentages and find best/worst
    const times = Object.keys(timeStats).map(time => {
        const stats = timeStats[time];
        const percentage = (stats.taken / stats.total) * 100;
        return {
            time: time,
            percentage: percentage,
            taken: stats.taken,
            total: stats.total
        };
    });
    
    times.sort((a, b) => b.percentage - a.percentage);
    
    const best = times[0];
    const worst = times[times.length - 1];
    
    container.innerHTML = `
        <div class="adherence-stats">
            <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <div class="stat-number">${formatTime(best.time)}</div>
                <div class="stat-label">Best Time (${best.percentage.toFixed(0)}%)</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                <div class="stat-number">${formatTime(worst.time)}</div>
                <div class="stat-label">Worst Time (${worst.percentage.toFixed(0)}%)</div>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px;">All Times</h3>
            ${times.map(t => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--item-bg); margin-bottom: 8px; border-radius: 8px;">
                    <span><strong>${formatTime(t.time)}</strong></span>
                    <span>${t.taken}/${t.total} (${t.percentage.toFixed(0)}%)</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ================================
// JOURNAL FUNCTIONS
// ================================

// Initialize journal tab
function loadJournal() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('journal-date').value = today;
    
    // Setup mood button listeners
    setupMoodButtons();
    
    // Load today's entry if it exists
    loadJournalEntry();
    
    // Load calendar
    updateJournalCalendar();
}

// Setup mood button click handlers
function setupMoodButtons() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            moodButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Save journal entry
async function saveJournalEntry() {
    const date = document.getElementById('journal-date').value;
    const mood = document.querySelector('.mood-btn.selected')?.getAttribute('data-mood');
    const energy = parseInt(document.getElementById('energy-slider').value);
    const pain = parseInt(document.getElementById('pain-slider').value);
    const notes = document.getElementById('journal-notes').value;
    
    // Get checked side effects
    const sideEffects = Array.from(document.querySelectorAll('.side-effect-checkbox input:checked'))
        .map(cb => cb.value);
    
    if (!mood) {
        showJournalMessage('Please select a mood', 'error');
        return;
    }
    
    try {
        const { data: user } = await supabase.auth.getUser();
        
        // Check if entry exists for this date
        const { data: existing } = await supabase
            .from('journal_entries')
            .select('id')
            .eq('user_id', user.user.id)
            .eq('entry_date', date)
            .single();
        
        if (existing) {
            // Update existing entry
            const { error } = await supabase
                .from('journal_entries')
                .update({
                    mood,
                    energy_level: energy,
                    pain_level: pain,
                    side_effects: sideEffects,
                    notes
                })
                .eq('id', existing.id);
            
            if (error) throw error;
            showJournalMessage('Journal entry updated successfully!', 'success');
        } else {
            // Create new entry
            const { error } = await supabase
                .from('journal_entries')
                .insert({
                    user_id: user.user.id,
                    entry_date: date,
                    mood,
                    energy_level: energy,
                    pain_level: pain,
                    side_effects: sideEffects,
                    notes
                });
            
            if (error) throw error;
            showJournalMessage('Journal entry saved successfully!', 'success');
        }
        
        // Refresh calendar
        updateJournalCalendar();
        
    } catch (error) {
        console.error('Error saving journal:', error);
        showJournalMessage('Error saving journal entry', 'error');
    }
}

// Load journal entry for selected date
async function loadJournalEntry() {
    const date = document.getElementById('journal-date').value;
    
    try {
        const { data: user } = await supabase.auth.getUser();
        
        const { data: entry, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.user.id)
            .eq('entry_date', date)
            .single();
        
        if (entry) {
            // Populate form with existing entry
            document.getElementById('energy-slider').value = entry.energy_level;
            document.getElementById('energy-value').textContent = entry.energy_level;
            document.getElementById('pain-slider').value = entry.pain_level;
            document.getElementById('pain-value').textContent = entry.pain_level;
            document.getElementById('journal-notes').value = entry.notes || '';
            
            // Set mood
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.getAttribute('data-mood') === entry.mood) {
                    btn.classList.add('selected');
                }
            });
            
            // Set side effects
            document.querySelectorAll('.side-effect-checkbox input').forEach(cb => {
                cb.checked = entry.side_effects?.includes(cb.value) || false;
            });
            
        } else {
            // Clear form for new entry
            document.getElementById('energy-slider').value = 5;
            document.getElementById('energy-value').textContent = '5';
            document.getElementById('pain-slider').value = 5;
            document.getElementById('pain-value').textContent = '5';
            document.getElementById('journal-notes').value = '';
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            document.querySelectorAll('.side-effect-checkbox input').forEach(cb => cb.checked = false);
        }
        
    } catch (error) {
        // Entry doesn't exist, that's okay
        console.log('No entry for this date');
    }
}

// Update journal calendar
async function updateJournalCalendar() {
    try {
        const { data: user } = await supabase.auth.getUser();
        
        // Get last 30 days of entries
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: entries, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.user.id)
            .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('entry_date', { ascending: false });
        
        if (error) throw error;
        
        const calendar = document.getElementById('journal-calendar');
        const today = new Date().toISOString().split('T')[0];
        
        if (entries && entries.length > 0) {
            calendar.innerHTML = entries.map(entry => {
                const entryDate = new Date(entry.entry_date + 'T00:00:00');
                const dayNumber = entryDate.getDate();
                const mood = getMoodEmoji(entry.mood);
                const isToday = entry.entry_date === today;
                
                return `
                    <div class="calendar-day has-entry ${isToday ? 'today' : ''}" 
                         onclick="displayJournalEntry('${entry.entry_date}')">
                        <div class="calendar-day-number">${dayNumber}</div>
                        <div class="calendar-day-mood">${mood}</div>
                    </div>
                `;
            }).join('');
        } else {
            calendar.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>No journal entries yet. Start tracking your daily wellness!</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
}

// Display journal entry in detail view
async function displayJournalEntry(date) {
    try {
        const { data: user } = await supabase.auth.getUser();
        
        const { data: entry, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.user.id)
            .eq('entry_date', date)
            .single();
        
        if (error) throw error;
        
        const displayDiv = document.getElementById('past-entry-display');
        const contentDiv = document.getElementById('entry-content');
        
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        contentDiv.innerHTML = `
            <h4>${formattedDate}</h4>
            
            <div class="journal-stats">
                <div class="journal-stat">
                    <div class="journal-stat-label">Mood</div>
                    <div class="journal-stat-value">${getMoodEmoji(entry.mood)}</div>
                </div>
                <div class="journal-stat">
                    <div class="journal-stat-label">Energy</div>
                    <div class="journal-stat-value">${entry.energy_level}/10</div>
                </div>
                <div class="journal-stat">
                    <div class="journal-stat-label">Pain</div>
                    <div class="journal-stat-value">${entry.pain_level}/10</div>
                </div>
            </div>
            
            ${entry.side_effects && entry.side_effects.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h4 style="margin-bottom: 10px;">Side Effects:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${entry.side_effects.map(effect => `
                            <span style="background: var(--item-bg); padding: 6px 12px; border-radius: 15px; font-size: 0.9em;">
                                ${effect}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${entry.notes ? `
                <div style="margin: 20px 0;">
                    <h4 style="margin-bottom: 10px;">Notes:</h4>
                    <p style="color: var(--text-secondary); line-height: 1.6;">${entry.notes}</p>
                </div>
            ` : ''}
            
            <button class="btn btn-secondary" onclick="document.getElementById('past-entry-display').style.display='none'">
                Close
            </button>
        `;
        
        displayDiv.style.display = 'block';
        displayDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error displaying entry:', error);
    }
}

// Get mood emoji
function getMoodEmoji(mood) {
    const moodMap = {
        'great': '😄',
        'good': '🙂',
        'okay': '😐',
        'bad': '☹️',
        'terrible': '😞'
    };
    return moodMap[mood] || '😐';
}

// Show journal message
function showJournalMessage(message, type) {
    const messageDiv = document.getElementById('journal-message');
    messageDiv.innerHTML = `
        <div class="alert alert-${type === 'success' ? 'success' : 'error'}">
            ${message}
        </div>
    `;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}
