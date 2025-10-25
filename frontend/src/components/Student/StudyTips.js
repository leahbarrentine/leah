import React, { useState } from 'react';
import './StudyTips.css';

function StudyTips({ tips }) {
  const [expanded, setExpanded] = useState({});

  const toggleSubject = (subject) => {
    setExpanded(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  return (
    <div className="card study-tips-card">
      <h3>Recommended Study Tips</h3>
      <p className="tips-intro">Based on your performance, here are some tips to help you improve:</p>
      
      <div className="tips-container">
        {Object.entries(tips).map(([subject, subjectTips]) => (
          <div key={subject} className="subject-tips">
            <button 
              className="subject-header"
              onClick={() => toggleSubject(subject)}
            >
              <strong>{subject.charAt(0).toUpperCase() + subject.slice(1)}</strong>
              <span className="expand-icon">{expanded[subject] ? '−' : '+'}</span>
            </button>
            
            {expanded[subject] && (
              <ul className="tips-list">
                {subjectTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyTips;