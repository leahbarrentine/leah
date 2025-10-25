import React from 'react';
import './Navigation.css';

function Navigation({ activeTab, onTabChange, onLogout, userType, userName }) {
  return (
    <nav className="navigation-wrapper">
      {/* Top bar - Dark blue with branding */}
      <div className="navigation-top-bar">
        <div className="nav-container">
          <div className="nav-brand">2 Steps Ahead</div>
          <div className="nav-user-section">
            <span className="user-name">{userName}</span>
            <button className="nav-logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Lower bar - Softer blue with navigation */}
      <div className="navigation-lower-bar">
        <div className="nav-container">
          <div className="nav-links">
            <button
              className={`nav-bubble ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => onTabChange('overview')}
            >
              Overview
            </button>
            {userType === 'student' && (
              <button
                className={`nav-bubble ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => onTabChange('assignments')}
              >
                Assignments
              </button>
            )}
            {userType === 'teacher' && (
              <>
                <button
                  className={`nav-bubble ${activeTab === 'grading' ? 'active' : ''}`}
                  onClick={() => onTabChange('grading')}
                >
                  Grading Window
                </button>
                <button
                  className={`nav-bubble ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => onTabChange('performance')}
                >
                  Performance Overviews
                </button>
              </>
            )}
            <button
              className={`nav-bubble ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => onTabChange('messages')}
            >
              Messages
            </button>
            {userType === 'student' && (
              <button
                className={`nav-bubble ${activeTab === 'tips' ? 'active' : ''}`}
                onClick={() => onTabChange('tips')}
              >
                Tips
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;