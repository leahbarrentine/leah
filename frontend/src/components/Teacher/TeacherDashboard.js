import React, { useState, useEffect } from 'react';
import { teacherAPI, studentAPI } from '../../api';
import Messaging from '../Messaging/Messaging';
import Navigation from '../Navigation';
import PerformanceChart from '../Student/PerformanceChart';
import './TeacherDashboard.css';

function TeacherDashboard({ userId, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState({});
  const [completedGradingTasks, setCompletedGradingTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'grading', 'messages', 'scheduling'
  const [taskSort, setTaskSort] = useState('none'); // 'none', 'dueDate'

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      const response = await teacherAPI.getDashboard(userId);
      setDashboard(response.data);
      
      // Load performance data for at-risk students
      if (response.data.at_risk_students) {
        const performanceData = {};
        for (const { student } of response.data.at_risk_students) {
          try {
            const perfResponse = await studentAPI.getPerformance(student.id);
            performanceData[student.id] = perfResponse.data;
          } catch (error) {
            console.error(`Error loading performance for student ${student.id}:`, error);
          }
        }
        setStudentPerformance(performanceData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="container">Error loading dashboard</div>;
  }

  const { teacher, at_risk_students, classes } = dashboard;
  
  // Generate grading plan tasks with categories and deadlines
  const gradingTasks = [];
  const today = new Date();
  
  // Add assignments that need grading (category: 'grading')
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.at_risk_subjects && prediction.at_risk_subjects.length > 0) {
      prediction.at_risk_subjects.forEach(subject => {
        if (!subject.grade || subject.grade === null) {
          const deadline = new Date(today);
          deadline.setDate(deadline.getDate() + 3); // 3 days from now
          gradingTasks.push({
            text: `Grade ${subject.assignment} for ${student.name}`,
            category: 'grading',
            deadline: deadline
          });
        }
      });
    }
  });
  
  // Add feedback to send for low-performing students (category: 'messages')
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.risk_level === 'high') {
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + 1); // 1 day from now
      gradingTasks.push({
        text: `Send encouraging feedback to ${student.name}`,
        category: 'messages',
        deadline: deadline
      });
    }
  });
  
  // Add check-ins for at-risk students (category: 'scheduling')
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.risk_level === 'high' || prediction.declining) {
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + 2); // 2 days from now
      gradingTasks.push({
        text: `Schedule check-in with ${student.name}`,
        category: 'scheduling',
        deadline: deadline
      });
    }
  });
  
  // Filter and sort tasks
  const filteredTasks = gradingTasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.category === taskFilter;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (taskSort === 'dueDate') {
      return a.deadline - b.deadline;
    }
    return 0;
  });
  
  // Filter out completed tasks
  const pendingGradingTasks = sortedTasks.filter(task => !completedGradingTasks.includes(task.text));
  const completedTaskObjects = sortedTasks.filter(task => completedGradingTasks.includes(task.text));
  
  // Handle task completion
  const handleGradingTaskToggle = (taskText) => {
    if (completedGradingTasks.includes(taskText)) {
      setCompletedGradingTasks(completedGradingTasks.filter(t => t !== taskText));
    } else {
      setCompletedGradingTasks([...completedGradingTasks, taskText]);
    }
  };
  
  // Format deadline for display
  const formatDeadline = (deadline) => {
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <>
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout}
        userType="teacher"
        userName={teacher.name}
      />
      <div className="teacher-dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {teacher.name}</h1>
          <p>Monitor student progress and provide support</p>
        </div>

      {activeTab === 'overview' && (
        <>
          {/* Teacher Grading Plan */}
          {gradingTasks.length > 0 && (
            <div className="grading-plan-card">
              <div className="grading-plan-header">
                <h3>Your Grading Plan</h3>
                <div className="task-controls">
                  <select 
                    className="task-filter-select"
                    value={taskFilter} 
                    onChange={(e) => setTaskFilter(e.target.value)}
                  >
                    <option value="all">View All</option>
                    <option value="grading">Grading</option>
                    <option value="messages">Messages to Send</option>
                    <option value="scheduling">Scheduling</option>
                  </select>
                  <select 
                    className="task-sort-select"
                    value={taskSort} 
                    onChange={(e) => setTaskSort(e.target.value)}
                  >
                    <option value="none">Default Order</option>
                    <option value="dueDate">Sort by Next Due</option>
                  </select>
                </div>
              </div>
              
              {pendingGradingTasks.length > 0 && (
                <>
                  <h4 className="section-title">To Do</h4>
                  <div className="grading-checklist">
                    {pendingGradingTasks.map((task, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item clickable"
                        onClick={() => handleGradingTaskToggle(task.text)}
                      >
                        <div className="task-content">
                          <span className="checkbox">☐</span>
                          <span className="task-text">{task.text}</span>
                        </div>
                        <div className="task-meta">
                          <span className={`task-category ${task.category}`}>
                            {task.category}
                          </span>
                          <span className="task-deadline">
                            Due: {formatDeadline(task.deadline)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {completedTaskObjects.length > 0 && (
                <>
                  <h4 className="section-title completed-section">Completed</h4>
                  <div className="grading-checklist completed">
                    {completedTaskObjects.map((task, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item completed clickable"
                        onClick={() => handleGradingTaskToggle(task.text)}
                      >
                        <div className="task-content">
                          <span className="checkbox checked">☑</span>
                          <span className="task-text">{task.text}</span>
                        </div>
                        <div className="task-meta">
                          <span className={`task-category ${task.category}`}>
                            {task.category}
                          </span>
                          <span className="task-deadline">
                            Due: {formatDeadline(task.deadline)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        
          {!at_risk_students || at_risk_students.length === 0 ? (
            <div className="card">
              <p className="no-data">
                Great news! No students are currently at risk.
              </p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {at_risk_students.map(({ student, prediction }) => (
                <div key={student.id} className={`at-risk-card ${prediction.risk_level === 'high' ? 'high-risk' : prediction.risk_level === 'medium' ? 'medium-risk' : 'low-risk'}`}>
                  <div className="student-info">
                    <div>
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </div>
                    <span className={`risk-badge ${prediction.risk_level}`}>
                      {prediction.risk_level} risk
                    </span>
                  </div>

                  {prediction.declining && (
                    <div className="performance-alert">
                      Performance declining by {(prediction.decline_percentage * 100).toFixed(1)}%
                    </div>
                  )}

                  {studentPerformance[student.id] && (
                    <div className="performance-chart-container">
                      <h4>Performance Trend</h4>
                      <PerformanceChart data={studentPerformance[student.id]} />
                    </div>
                  )}

                  {prediction.current_performance && (
                    <div className="performance-metrics">
                      <div className="metric">
                        <span className="metric-label">Average Grade</span>
                        <span className="metric-value">
                          {prediction.current_performance.avg_grade ? 
                            `${prediction.current_performance.avg_grade.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Completion</span>
                        <span className="metric-value">
                          {(prediction.current_performance.completion_rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {prediction.at_risk_subjects.length > 0 && (
                    <div className="at-risk-subjects">
                      <strong>Challenging Assignments:</strong>
                      <div className="subjects-list">
                        {prediction.at_risk_subjects.map((subject, idx) => (
                          <div key={idx} className="challenging-assignment">
                            <span className="subject-tag">{subject.assignment}</span>
                            <div className="assignment-feedback">
                              <div className="grade-info">
                                <span className="label">Student's Grade:</span>
                                <span className="grade-value">{subject.grade ? `${subject.grade.toFixed(0)}%` : 'Not graded'}</span>
                              </div>
                              <div className="suggested-feedback">
                                <strong>Suggested Feedback:</strong>
                                <p className="feedback-text">
                                  {subject.grade && subject.grade < 60 
                                    ? `I noticed you're having difficulty with ${subject.assignment}. Let's schedule time to review the core concepts together. Would you like to meet during office hours this week?`
                                    : subject.grade && subject.grade < 75
                                    ? `You're making progress on ${subject.assignment}, but there's room for improvement. Consider reviewing the material and attempting some practice problems. I'm here if you need help!`
                                    : `Good effort on ${subject.assignment}! To reach the next level, focus on [specific concept]. Keep up the good work!`
                                  }
                                </p>
                                <button 
                                  className="send-feedback-btn"
                                  onClick={async () => {
                                    const feedbackMessage = subject.grade && subject.grade < 60 
                                      ? `I noticed you're having difficulty with ${subject.assignment}. Let's schedule time to review the core concepts together. Would you like to meet during office hours this week?`
                                      : subject.grade && subject.grade < 75
                                      ? `You're making progress on ${subject.assignment}, but there's room for improvement. Consider reviewing the material and attempting some practice problems. I'm here if you need help!`
                                      : `Good effort on ${subject.assignment}! To reach the next level, focus on [specific concept]. Keep up the good work!`;
                                    
                                    try {
                                      const { messageAPI } = await import('../../api');
                                      await messageAPI.sendMessage({
                                        sender_id: userId,
                                        sender_type: 'teacher',
                                        recipient_id: student.id,
                                        recipient_type: 'student',
                                        content: feedbackMessage
                                      });
                                      alert(`Feedback sent to ${student.name}!`);
                                    } catch (error) {
                                      console.error('Error sending feedback:', error);
                                      alert('Failed to send feedback. Please try again.');
                                    }
                                  }}
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    className="button-primary"
                    onClick={() => setSelectedStudent(student)}
                  >
                    Send Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'assignments' && (
        <div className="assignments-to-grade-section">
          <h2>Assignments to Grade</h2>
          <div className="assignments-grid">
            {at_risk_students.flatMap(({ student, prediction }) => 
              prediction.at_risk_subjects
                .filter(subject => !subject.grade || subject.grade === null)
                .map((subject, idx) => ({
                  student,
                  subject,
                  key: `${student.id}-${idx}`
                }))
            ).length === 0 ? (
              <div className="empty-state">
                <p>All assignments are graded! Great work!</p>
              </div>
            ) : (
              at_risk_students.flatMap(({ student, prediction }) => 
                prediction.at_risk_subjects
                  .filter(subject => !subject.grade || subject.grade === null)
                  .map((subject, idx) => (
                    <div key={`${student.id}-${idx}`} className="assignment-to-grade-card">
                      <div className="assignment-header-section">
                        <h3>{subject.assignment}</h3>
                        <span className="student-name-badge">{student.name}</span>
                      </div>
                      <div className="assignment-details-section">
                        <div className="detail-item">
                          <span className="detail-label">Student:</span>
                          <span className="detail-value">{student.email}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value status-pending">Needs Grading</span>
                        </div>
                      </div>
                      <button className="grade-button">Grade Assignment</button>
                    </div>
                  ))
              )
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <Messaging userId={userId} userType="teacher" />
      )}

      {/* Message Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Send Message to {selectedStudent.name}</h3>
            <Messaging 
              userId={userId} 
              userType="teacher" 
              preSelectedRecipient={{
                id: selectedStudent.id,
                type: 'student',
                name: selectedStudent.name
              }}
              initialMessage={selectedStudent.prefilledMessage || ''}
            />
            <button className="button button-secondary" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default TeacherDashboard;