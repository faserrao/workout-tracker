import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));

// Database file for persistence
const DB_FILE = join(__dirname, 'workout-data.json');

// Initialize database
function initDB() {
  if (!existsSync(DB_FILE)) {
    const initialData = {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      weeks: []
    };
    writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Load database
function loadDB() {
  return JSON.parse(readFileSync(DB_FILE, 'utf8'));
}

// Save database
function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Endpoints

// Get configuration
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Get workout data
app.get('/api/workout-data', (req, res) => {
  const data = loadDB();
  res.json(data);
});

// Set start date
app.post('/api/set-start-date', (req, res) => {
  const { startDate } = req.body;
  const data = loadDB();
  data.startDate = startDate;
  saveDB(data);
  res.json({ success: true, startDate });
});

// Get week data
app.get('/api/week/:weekNumber', (req, res) => {
  const weekNumber = parseInt(req.params.weekNumber);
  const data = loadDB();
  
  const startDate = new Date(data.startDate);
  const weekStart = addDays(startDate, (weekNumber - 1) * 7);
  const weekEnd = addDays(weekStart, 6);
  
  let week = data.weeks.find(w => w.weekNumber === weekNumber);
  
  if (!week) {
    // Create new week structure
    week = {
      weekNumber,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      days: []
    };
    
    // Create days for the week
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(weekStart, i);
      week.days.push({
        date: format(dayDate, 'yyyy-MM-dd'),
        dayName: format(dayDate, 'EEEE').toUpperCase(),
        focusAreas: [],
        exercises: [],
        cardio: '',
        notes: ''
      });
    }
    
    data.weeks.push(week);
    saveDB(data);
  }
  
  res.json(week);
});

// Save week data
app.post('/api/week/:weekNumber', (req, res) => {
  const weekNumber = parseInt(req.params.weekNumber);
  const weekData = req.body;
  
  const data = loadDB();
  const weekIndex = data.weeks.findIndex(w => w.weekNumber === weekNumber);
  
  if (weekIndex >= 0) {
    data.weeks[weekIndex] = { ...weekData, weekNumber };
  } else {
    data.weeks.push({ ...weekData, weekNumber });
  }
  
  saveDB(data);
  res.json({ success: true });
});

// Get exercises for selected focus areas
app.post('/api/exercises-for-focus', (req, res) => {
  const { focusAreas } = req.body;
  const exercises = new Set();
  
  // Combine all focus areas
  const allFocusAreas = [...config.focusAreas.weights, ...config.focusAreas.other];
  
  focusAreas.forEach(focusId => {
    const area = allFocusAreas.find(a => a.id === focusId);
    if (area) {
      area.exercises.forEach(ex => exercises.add(ex));
    }
  });
  
  res.json(Array.from(exercises).sort());
});

// Export week data
app.get('/api/export/week/:weekNumber', (req, res) => {
  const weekNumber = parseInt(req.params.weekNumber);
  const data = loadDB();
  const week = data.weeks.find(w => w.weekNumber === weekNumber);
  
  if (!week) {
    return res.status(404).json({ error: 'Week not found' });
  }
  
  res.json(week);
});

// Initialize database and start server
initDB();

app.listen(PORT, () => {
  console.log(`Workout Tracker server running on http://localhost:${PORT}`);
});