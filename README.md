# 2 Steps Ahead

An intelligent educational support prediction application that helps students stay on track and teachers provide timely intervention.

## Features

- **Student Dashboard**: Track performance, view personalized study plans, and monitor progress
- **Teacher Dashboard**: Identify at-risk students, view performance trends, and manage grading tasks
- **Predictive Analytics**: ML-based predictions for when students may need support
- **Real-time Messaging**: Direct communication between students and teachers
- **Performance-based Motivational System**: Contextual quotes and study tips based on student performance
- **Interactive Task Management**: Checkable study plans and grading checklists

## Tech Stack

- **Backend**: Python, Flask, SQLAlchemy, scikit-learn
- **Frontend**: React, React Router
- **Database**: SQLite
- **Styling**: Custom CSS with modern earth-tone design system

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Seed the database with sample data:
```bash
python seed_db.py
```

5. Start the backend server:
```bash
python app.py
```

The backend will run on http://localhost:5001

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

### Login Credentials

**Students:**
- Alice Johnson
- Bob Smith
- Charlie Brown

**Teachers:**
- Ms. Johnson
- Mr. Davis

Simply select your account from the dropdown on the login page.

## Design Features

- Modern earth-tone color scheme (sky blue, light green, light purple)
- Performance color coding (green: 90%+, yellow: 75-89%, red: <75%)
- Glassmorphism effects and smooth animations
- Responsive card-based layouts
- Interactive checkable task lists

## License

MIT