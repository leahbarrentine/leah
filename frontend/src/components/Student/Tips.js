import React from 'react';
import './Tips.css';

function Tips() {
  const tips = [
    {
      id: 1,
      category: 'Time Management',
      title: 'Break Down Large Assignments',
      description: 'Divide big projects into smaller, manageable tasks. Set deadlines for each part to avoid last-minute stress.',
      icon: '📋'
    },
    {
      id: 2,
      category: 'Study Techniques',
      title: 'Active Recall Practice',
      description: 'Test yourself regularly instead of just re-reading notes. This strengthens memory and identifies gaps in understanding.',
      icon: '🧠'
    },
    {
      id: 3,
      category: 'Problem Solving',
      title: 'Work Through Examples',
      description: 'Before attempting homework, review similar examples from class. Understanding the process is key to solving new problems.',
      icon: '💡'
    },
    {
      id: 4,
      category: 'Getting Help',
      title: 'Ask Questions Early',
      description: 'Don\'t wait until the day before an assignment is due to ask for help. Reach out during office hours or form study groups.',
      icon: '🙋'
    },
    {
      id: 5,
      category: 'Organization',
      title: 'Keep a Master Calendar',
      description: 'Track all assignment due dates, tests, and commitments in one place. Review it daily to stay on top of deadlines.',
      icon: '📅'
    },
    {
      id: 6,
      category: 'Focus',
      title: 'Minimize Distractions',
      description: 'Find a quiet study space and turn off phone notifications. Use techniques like the Pomodoro method (25 min work, 5 min break).',
      icon: '🎯'
    },
    {
      id: 7,
      category: 'Understanding',
      title: 'Teach Someone Else',
      description: 'Explain concepts to a friend or even to yourself out loud. If you can teach it, you truly understand it.',
      icon: '👥'
    },
    {
      id: 8,
      category: 'Resources',
      title: 'Use Multiple Resources',
      description: 'If you\'re stuck, try different explanations - textbook, online videos, classmates, or tutoring. Everyone learns differently.',
      icon: '📚'
    },
    {
      id: 9,
      category: 'Test Preparation',
      title: 'Practice Under Test Conditions',
      description: 'Time yourself and work without notes to simulate test conditions. This builds confidence and identifies weak areas.',
      icon: '⏱️'
    },
    {
      id: 10,
      category: 'Challenging Assignments',
      title: 'Start Early on Difficult Topics',
      description: 'Give yourself extra time for subjects you find challenging. This allows for multiple practice attempts and seeking help if needed.',
      icon: '⚡'
    }
  ];

  return (
    <div className="tips-container">
      <div className="tips-header">
        <h2>Study Tips & Strategies</h2>
        <p>Helpful advice to improve your academic performance</p>
      </div>
      
      <div className="tips-grid">
        {tips.map(tip => (
          <div key={tip.id} className="tip-card">
            <div className="tip-icon">{tip.icon}</div>
            <div className="tip-category">{tip.category}</div>
            <h3 className="tip-title">{tip.title}</h3>
            <p className="tip-description">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tips;