import React from 'react';
import './Navigation.css';

function Navigation({ activeTab, onTabChange, onLogout, userType }) {
  return (
    <nav className="navigation-toolbar">
      <div className="nav-container">
        <div className="nav-brand">2 Steps Ahead</div>
        <div className="nav-links">
          <button
            className={`nav-bubble ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => onTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`nav-bubble ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => onTabChange('assignments')}
          >
            Assignments
          </button>
          <button
            className={`nav-bubble ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => onTabChange('messages')}
          >
            Messages
          </button>
          <button className="nav-bubble logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;