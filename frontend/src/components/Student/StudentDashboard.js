import React, { useState, useEffect } from 'react';
import { studentAPI, messageAPI } from '../../api';
import PerformanceChart from './PerformanceChart';
import StudyTips from './StudyTips';
import Messaging from '../Messaging/Messaging';
import Navigation from '../Navigation';
import './StudentDashboard.css';

// Motivational quotes based on performance - aligned with risk level
const getMotivationalQuote = (avgGrade, riskLevel) => {
  // If student is at risk, provide motivational but realistic encouragement
  if (riskLevel === 'high' || riskLevel === 'medium') {
    const quotes = [
      "Keep working hard - every effort counts toward improvement.",
      "Stay focused and committed. You can turn this around.",
      "Consistency is key. Keep pushing forward one step at a time.",
      "Don't give up. Reach out for help and keep trying."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // For students performing well
  if (avgGrade >= 90) {
    const quotes = [
      "Outstanding work! Keep up this exceptional performance!",
      "You're excelling! Your hard work is paying off beautifully.",
      "Brilliant! You're setting a great example for others."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else if (avgGrade >= 75) {
    const quotes = [
      "Great job! You're on the right track to excellence.",
      "Well done! Keep pushing forward and you'll reach the top.",
      "Good work! Your effort is showing positive results."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else {
    const quotes = [
      "Keep working hard - progress takes time and effort.",
      "Stay committed to your goals. You're building important skills.",
      "Focus on improvement, not perfection. Keep going!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

// Generate study plan based on performance
const generateStudyPlan = (avgGrade, completionRate, poorAssignments) => {
  const plan = [];
  
  if (avgGrade < 75) {
    plan.push("Review core concepts daily for 30 minutes");
    plan.push("Complete practice problems before attempting assignments");
  }
  
  if (completionRate < 0.8) {
    plan.push("Set reminders for assignment due dates");
    plan.push("Break large assignments into smaller tasks");
  }
  
  if (poorAssignments.length > 0) {
    plan.push(`Focus on improving in: ${poorAssignments.slice(0, 2).map(a => a.assignment.title).join(', ')}`);
  }
  
  plan.push("Ask questions during office hours");
  plan.push("Form a study group with classmates");
  
  return plan;
};

function StudentDashboard({ userId, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('upcoming'); // 'upcoming', 'all'
  const [assignmentSort, setAssignmentSort] = useState('dueDate'); // 'dueDate'
  
  // Helper function to get performance class
  const getPerformanceClass = (score) => {
    if (!score) return 'pending';
    if (score >= 90) return 'performance-excellent';
    if (score >= 75) return 'performance-good';
    return 'performance-poor';
  };
  
  // Helper function to get score class
  const getScoreClass = (score) => {
    if (!score) return '';
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    return 'poor';
  };

  useEffect(() => {
    loadDashboard();
    loadPerformance();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard(userId);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const loadPerformance = async () => {
    try {
      const response = await studentAPI.getPerformance(userId);
      setPerformance(response.data);
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="container">Error loading dashboard</div>;
  }

  const { student, prediction, upcoming_assignments, assignments_with_grades } = dashboard;
  const riskLevel = prediction.risk_level;
  
  // Calculate average grade and completion rate
  const gradesWithScores = assignments_with_grades.filter(item => item.grade && item.grade.score !== null);
  const avgGrade = gradesWithScores.length > 0 
    ? gradesWithScores.reduce((sum, item) => sum + item.grade.score, 0) / gradesWithScores.length 
    : 0;
  const completionRate = prediction.current_performance?.completion_rate || 0;
  
  // Identify poor performance assignments (below 75%)
  const poorAssignments = assignments_with_grades.filter(item => 
    item.grade && item.grade.score !== null && item.grade.score < 75
  );
  
  // Generate motivational quote and study plan
  const motivationalQuote = getMotivationalQuote(avgGrade, riskLevel);
  const studyPlan = generateStudyPlan(avgGrade, completionRate, poorAssignments);
  
  // Filter out completed tasks from study plan
  const pendingTasks = studyPlan.filter(task => !completedTasks.includes(task));
  
  // Handle task completion
  const handleTaskToggle = (task) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  return (
    <>
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout}
        userType="student"
        userName={student.name}
      />
      <div className="student-dashboard">

      {activeTab === 'overview' && (
        <div className="dashboard-grid">

          {/* Motivational Quote and Performance Alert Row */}
          <div className="quote-alert-row">
            <div className="motivational-card">
              <div className="quote-icon">💡</div>
              <p className="quote-text">{motivationalQuote}</p>
            </div>

            {/* Risk Alert */}
            {riskLevel !== 'low' && (
              <div className={`alert alert-${riskLevel === 'high' ? 'danger' : 'warning'}`}>
                <strong>Performance Alert:</strong> {riskLevel === 'high' ? 'Your performance has declined significantly.' : 'Your performance shows some decline.'}
                {prediction.declining && (
                  <span> Your grades have decreased by {(prediction.decline_percentage * 100).toFixed(1)}% this week.</span>
                )}
              </div>
            )}
          </div>
          
          {/* Study Plan */}
          {studyPlan.length > 0 && (
            <div className="study-plan-card">
              <h3>Your Personalized Study Plan</h3>
              
              {pendingTasks.length > 0 && (
                <>
                  <h4 className="section-title">To Do</h4>
                  <div className="study-checklist">
                    {pendingTasks.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item clickable"
                        onClick={() => handleTaskToggle(item)}
                      >
                        <span className="checkbox">☐</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {completedTasks.length > 0 && (
                <>
                  <h4 className="section-title completed-section">Completed</h4>
                  <div className="study-checklist completed">
                    {completedTasks.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item completed clickable"
                        onClick={() => handleTaskToggle(item)}
                      >
                        <span className="checkbox checked">☑</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Poor Performance Assignments */}
          {poorAssignments.length > 0 && (
            <div className="improvement-card">
              <h3>Areas for Improvement</h3>
              <p>Focus on these assignments where you scored below 75%:</p>
              <div className="poor-assignments-list">
                {poorAssignments.map(item => (
                  <div key={item.assignment.id} className="poor-assignment-item">
                    <div className="assignment-details">
                      <strong>{item.assignment.title}</strong>
                      <span className="assignment-subject">{item.assignment.subject}</span>
                    </div>
                    <div className="score-badge poor">{item.grade.score.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Tips */}
          {prediction.should_emphasize_tips && Object.keys(prediction.study_tips).length > 0 && (
            <StudyTips tips={prediction.study_tips} />
          )}

          {/* Performance Chart */}
          <div className="card">
            <h3>Performance Trend</h3>
            <PerformanceChart data={performance} />
          </div>

          {/* Upcoming Assignments */}
          <div className="card">
            <h3>Upcoming Assignments</h3>
            {upcoming_assignments.length === 0 ? (
              <p>No upcoming assignments</p>
            ) : (
              <div className="assignments-list">
                {upcoming_assignments.map(assignment => (
                  <div key={assignment.id} className="assignment-item">
                    <div className="assignment-info">
                      <strong>{assignment.title}</strong>
                      <span className="assignment-subject">{assignment.subject}</span>
                    </div>
                    <div className="assignment-due">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* At-Risk Subjects */}
          {prediction.at_risk_subjects.length > 0 && (
            <div className="card">
              <h3>Challenging Assignments Ahead</h3>
              <p>Based on historical data, many students found these upcoming assignments challenging:</p>
              <div className="at-risk-list">
                {prediction.at_risk_subjects.map((subject, idx) => (
                  <div key={idx} className="at-risk-item">
                    <strong>{subject.assignment}</strong>
                    <p>{(subject.stuck_percentage * 100).toFixed(0)}% of students struggled with this in the past</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="dashboard-card">
          <div className="card-header">
            <h2>All Assignments</h2>
            <div className="assignment-controls">
              <select 
                className="filter-select"
                value={assignmentFilter} 
                onChange={(e) => setAssignmentFilter(e.target.value)}
              >
                <option value="upcoming">Show Upcoming Only</option>
                <option value="all">Show All</option>
              </select>
              <select 
                className="sort-select"
                value={assignmentSort} 
                onChange={(e) => setAssignmentSort(e.target.value)}
              >
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>
          </div>
          <div className="assignments-list">
            {assignments_with_grades
              .filter(item => {
                if (assignmentFilter === 'upcoming') {
                  const dueDate = new Date(item.assignment.due_date);
                  const today = new Date();
                  return dueDate >= today || !item.grade || item.grade.completion_status !== 'completed';
                }
                return true;
              })
              .sort((a, b) => {
                if (assignmentSort === 'dueDate') {
                  return new Date(a.assignment.due_date) - new Date(b.assignment.due_date);
                }
                return 0;
              })
              .map(item => {
              const score = item.grade?.score;
              const performanceClass = getPerformanceClass(score);
              const scoreClass = getScoreClass(score);
              
              return (
                <div key={item.assignment.id} className={`assignment-item ${performanceClass}`}>
                  <div className="assignment-header">
                    <div className="assignment-info">
                      <div className="assignment-title">{item.assignment.title}</div>
                      <div className="assignment-subject">{item.assignment.subject}</div>
                    </div>
                    {item.grade && score !== null && (
                      <div className={`assignment-score ${scoreClass}`}>
                        {score.toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <div className="assignment-meta">
                    <span>Due: {new Date(item.assignment.due_date).toLocaleDateString()}</span>
                    {item.grade && (
                      <span>Status: {item.grade.completion_status}</span>
                    )}
                    {!item.grade && (
                      <span>Status: Not submitted</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <Messaging userId={userId} userType="student" />
      )}
    </div>
    </>
  );
}

export default StudentDashboard;