import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentDashboard from './components/Student/StudentDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            user ? (
              user.type === 'student' ? (
                <StudentDashboard userId={user.id} onLogout={() => setUser(null)} />
              ) : (
                <TeacherDashboard userId={user.id} onLogout={() => setUser(null)} />
              )
            ) : (
              <Login onLogin={setUser} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;