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
        {user && (
          <nav className="navbar">
            <div className="nav-container">
              <h1 className="nav-title">2 Steps Ahead</h1>
              <div className="nav-user">
                <span>{user.name} ({user.type})</span>
                <button className="button button-secondary" onClick={() => setUser(null)}>
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}

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