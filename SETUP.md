# Setup Instructions

This guide will help you set up and run the Educational Support Prediction System.

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (open a new terminal)
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start the Backend Server

```bash
# In the backend directory (with virtual environment activated)
cd backend
python app.py
```

The backend API will be available at http://localhost:5000

### Start the Frontend Development Server

```bash
# In the frontend directory (in a separate terminal)
cd frontend
npm start
```

The frontend will open automatically at http://localhost:3000

## Using the Application

### Sample Users

After running `seed_data.py`, you'll have the following test users:

**Teachers:**
- Ms. Johnson (johnson@school.edu) - teaches Math and Science
- Mr. Smith (smith@school.edu) - teaches English and History
- Mrs. Davis (davis@school.edu) - teaches Science and Math

**Students:**
- Alice Chen (alice@student.edu)
- Bob Martinez (bob@student.edu)
- Carol Williams (carol@student.edu) - At-Risk
- David Brown (david@student.edu)
- Emma Johnson (emma@student.edu) - At-Risk
- Frank Lee (frank@student.edu)

### Features to Test

1. **Student Portal:**
   - View performance trends and grades
   - See upcoming assignments
   - Receive study tips when at-risk
   - Send messages to teachers

2. **Teacher Portal:**
   - Monitor at-risk students
   - View class statistics
   - Send messages to students
   - Track student performance

3. **Prediction System:**
   - Automatic detection of 10% performance decline
   - Historical trend analysis
   - Risk level classification (low, medium, high)
   - Subject-specific study tips

## Troubleshooting

### Backend Issues

- **Database errors:** Delete the `data/education.db` file and run `python seed_data.py` again
- **Port already in use:** Change the port in `backend/app.py` (last line)
- **Import errors:** Make sure virtual environment is activated and dependencies are installed

### Frontend Issues

- **CORS errors:** Ensure backend is running on http://localhost:5000
- **Connection refused:** Check that the backend server is running
- **Build errors:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Development Notes

- The backend uses SQLite for simplicity. For production, switch to PostgreSQL
- Sample data includes performance trends for the past 4 weeks
- At-risk detection runs based on weekly performance snapshots
- Messages are stored in the database but don't update in real-time (refresh to see new messages)