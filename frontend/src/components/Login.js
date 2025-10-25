import React, { useState, useEffect } from 'react';
import { generalAPI } from '../api';
import './Login.css';

function Login({ onLogin }) {
  const [userType, setUserType] = useState('student');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [userType]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = userType === 'student' 
        ? await generalAPI.getStudents()
        : await generalAPI.getTeachers();
      setUsers(response.data);
      if (response.data.length > 0) {
        setSelectedUser(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (selectedUser) {
      const user = users.find(u => u.id.toString() === selectedUser);
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        type: userType
      });
    }
  };

  return (
    <div className="login-container">
      {/* Decorative doodles */}
      <span className="doodle doodle-star-1">⭐</span>
      <span className="doodle doodle-star-2">✨</span>
      <svg className="doodle doodle-swirl-1" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 5 Q35 15 25 25 Q15 35 25 45" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
      <svg className="doodle doodle-swirl-2" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 25 Q25 10 40 25 Q25 40 10 25" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
      <span className="doodle doodle-smile-1">😊</span>
      <span className="doodle doodle-smile-2">🌟</span>
      
      {/* Space emojis */}
      <span className="doodle space-emoji saturn">🪐</span>
      <span className="doodle space-emoji rocket">🚀</span>
      <span className="doodle space-emoji sparkles-1">✨</span>
      <span className="doodle space-emoji sparkles-2">✨</span>
      
      {/* Additional left-side emojis */}
      <span className="doodle space-emoji moon">🌙</span>
      <span className="doodle space-emoji comet">☄️</span>
      <span className="doodle space-emoji planet">🌎</span>
      <span className="doodle space-emoji alien">👽</span>
      <span className="doodle space-emoji telescope">🔭</span>
      
      <div className="login-card">
        <h2>2 Steps Ahead</h2>
        <p className="login-subtitle">Select your account to continue</p>

        <div className="form-group">
          <label>I am a:</label>
          <div className="user-type-selector">
            <button
              className={`user-type-button ${userType === 'student' ? 'active' : ''}`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              className={`user-type-button ${userType === 'teacher' ? 'active' : ''}`}
              onClick={() => setUserType('teacher')}
            >
              Teacher
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="form-group">
              <label>Select Account:</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <button className="button login-button" onClick={handleLogin}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;