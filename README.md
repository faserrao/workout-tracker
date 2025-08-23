# Workout Tracker

A web-based workout tracking application that helps you plan, track, and analyze your fitness journey. Built with Node.js and designed for easy workout logging with comprehensive exercise database and progress tracking.

## Features

- **Exercise Database**: Pre-configured with 150+ exercises across all major muscle groups
- **Flexible Workout Planning**: Create custom workouts with any combination of exercises
- **Set Tracking**: Log multiple sets per exercise with weight and reps
- **Muscle Group Organization**: Exercises organized by body part (chest, back, legs, etc.)
- **Progress Tracking**: Track your workout history and see your improvements
- **JSON-Based Storage**: Simple, portable data storage
- **Responsive Web Interface**: Works on desktop and mobile devices
- **Excel Import/Export**: Compatible with Excel workout templates

## Project Structure

```
workout-tracker/
├── workout-tracker-app/
│   ├── server.js              # Express server and API endpoints
│   ├── config.json            # Exercise database and configuration
│   ├── workout-data.json      # Stored workout history
│   ├── public/
│   │   ├── index.html         # Main web interface
│   │   ├── style.css          # Application styling
│   │   └── script.js          # Frontend JavaScript
│   └── package.json           # Node.js dependencies
├── Workout_Planner_HeaderRows.xlsx  # Excel template
└── Workout_Tracker.xlsx            # Excel tracking spreadsheet
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd workout-tracker/workout-tracker-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser to `http://localhost:3000`

## Usage

### Creating a Workout

1. **Select Date**: Choose the date for your workout
2. **Add Exercises**: 
   - Click "Add Exercise"
   - Select muscle group (e.g., Chest, Back, Legs)
   - Choose specific exercise from dropdown
   - Add multiple exercises as needed

3. **Log Sets**: For each exercise:
   - Enter weight used
   - Enter number of repetitions
   - Click "Add Set" for multiple sets
   - Default is 3 sets, maximum 5 sets per exercise

4. **Save Workout**: Click "Save Workout" to store your session

### Viewing History

- Access previous workouts from the history section
- Filter by date or muscle group
- Export data for analysis

## Exercise Categories

### Weight Training
- **Chest**: Bench press, flyes, push-ups, dips, etc.
- **Back**: Pull-ups, rows, lat pulldowns, deadlifts, etc.
- **Biceps**: Curls, hammer curls, preacher curls, etc.
- **Triceps**: Pushdowns, dips, extensions, etc.
- **Shoulders**: Presses, raises, shrugs, etc.
- **Quads**: Squats, leg press, lunges, extensions, etc.
- **Hamstrings**: RDLs, leg curls, good mornings, etc.
- **Calves**: Calf raises, jumps, etc.
- **Abdominals**: Planks, crunches, leg raises, etc.
- **Glutes**: Hip thrusts, bridges, lunges, etc.

### Other Activities
- **Flexibility**: Yoga, stretching, mobility work
- **Cardio**: Running, cycling, swimming, HIIT, etc.

## Data Format

Workouts are stored in JSON format:
```json
{
  "date": "2024-08-15",
  "exercises": [
    {
      "focusArea": "chest",
      "exercise": "Barbell Bench Press",
      "sets": [
        { "weight": 135, "reps": 12 },
        { "weight": 155, "reps": 10 },
        { "weight": 175, "reps": 8 }
      ]
    }
  ]
}
```

## Configuration

Edit `config.json` to:
- Add or remove exercises
- Modify muscle group categories
- Change default set numbers
- Customize exercise options

## API Endpoints

- `GET /api/config` - Get exercise configuration
- `GET /api/workouts` - Retrieve all workouts
- `POST /api/workouts` - Save a new workout
- `GET /api/workouts/:date` - Get specific workout by date
- `DELETE /api/workouts/:date` - Delete a workout

## Excel Integration

The project includes Excel templates for those who prefer spreadsheet tracking:

1. **Workout_Planner_HeaderRows.xlsx**: Template for planning workouts
2. **Workout_Tracker.xlsx**: Spreadsheet for tracking progress

You can import/export between the web app and Excel formats.

## Tips for Best Results

1. **Be Consistent**: Log every workout for accurate progress tracking
2. **Progressive Overload**: Gradually increase weight or reps
3. **Rest Days**: Plan rest days between muscle groups
4. **Form First**: Focus on proper form before increasing weight
5. **Track Everything**: Include warm-up sets and cardio

## Development

### Tech Stack
- Backend: Node.js, Express.js
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Storage: JSON file-based storage
- No database required

### Adding New Features

1. **New Exercises**: Add to `config.json` under appropriate muscle group
2. **New Categories**: Add new focus area in config
3. **UI Changes**: Modify files in `public/` directory

## Future Enhancements

- [ ] Progress charts and analytics
- [ ] Personal records tracking
- [ ] Workout plan templates
- [ ] Social sharing features
- [ ] Mobile app version
- [ ] Cloud sync capability
- [ ] Exercise video links
- [ ] Rest timer between sets

## Requirements

- Node.js 12.x or higher
- npm 6.x or higher
- Modern web browser
- 10MB disk space for data storage

## Troubleshooting

### Common Issues

1. **Port Already in Use**: Change port in server.js or kill process on port 3000
2. **Cannot Save Workouts**: Check write permissions on workout-data.json
3. **Exercises Not Loading**: Verify config.json is valid JSON

### Data Backup

Regularly backup `workout-data.json` to prevent data loss.

## License

[Specify your license here]

## Contributing

[Contribution guidelines if applicable]

## Support

For issues and feature requests:
- Check existing workouts in workout-data.json
- Verify config.json structure
- Ensure server is running on correct port