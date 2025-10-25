import React, { useState, useEffect } from 'react';
import { teacherAPI, studentAPI } from '../../api';
import Messaging from '../Messaging/Messaging';
import Navigation from '../Navigation';
import PerformanceChart from '../Student/PerformanceChart';
import './TeacherDashboard.css';

function TeacherDashboard({ userId, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('at-risk');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState({});
  const [completedGradingTasks, setCompletedGradingTasks] = useState([]);

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
  
  // Generate grading plan tasks
  const gradingTasks = [];
  
  // Add assignments that need grading
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.at_risk_subjects && prediction.at_risk_subjects.length > 0) {
      prediction.at_risk_subjects.forEach(subject => {
        if (!subject.grade || subject.grade === null) {
          gradingTasks.push(`Grade ${subject.assignment} for ${student.name}`);
        }
      });
    }
  });
  
  // Add feedback to send for low-performing students
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.risk_level === 'high') {
      gradingTasks.push(`Send encouraging feedback to ${student.name}`);
    }
  });
  
  // Add check-ins for at-risk students
  at_risk_students.forEach(({ student, prediction }) => {
    if (prediction.risk_level === 'high' || prediction.declining) {
      gradingTasks.push(`Schedule check-in with ${student.name}`);
    }
  });
  
  // Filter out completed tasks
  const pendingGradingTasks = gradingTasks.filter(task => !completedGradingTasks.includes(task));
  
  // Handle task completion
  const handleGradingTaskToggle = (task) => {
    if (completedGradingTasks.includes(task)) {
      setCompletedGradingTasks(completedGradingTasks.filter(t => t !== task));
    } else {
      setCompletedGradingTasks([...completedGradingTasks, task]);
    }
  };

  return (
    <>
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout}
        userType="teacher"
      />
      <div className="teacher-dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {teacher.name}</h1>
          <p>Monitor student progress and provide support</p>
        </div>

      {activeTab === 'at-risk' && (
        <>
          {/* Teacher Grading Plan */}
          {gradingTasks.length > 0 && (
            <div className="grading-plan-card">
              <h3>Your Grading Plan</h3>
              
              {pendingGradingTasks.length > 0 && (
                <>
                  <h4 className="section-title">To Do</h4>
                  <div className="grading-checklist">
                    {pendingGradingTasks.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item clickable"
                        onClick={() => handleGradingTaskToggle(item)}
                      >
                        <span className="checkbox">☐</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {completedGradingTasks.length > 0 && (
                <>
                  <h4 className="section-title completed-section">Completed</h4>
                  <div className="grading-checklist completed">
                    {completedGradingTasks.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="checklist-item completed clickable"
                        onClick={() => handleGradingTaskToggle(item)}
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
                                  onClick={() => {
                                    const feedbackMessage = subject.grade && subject.grade < 60 
                                      ? `I noticed you're having difficulty with ${subject.assignment}. Let's schedule time to review the core concepts together. Would you like to meet during office hours this week?`
                                      : subject.grade && subject.grade < 75
                                      ? `You're making progress on ${subject.assignment}, but there's room for improvement. Consider reviewing the material and attempting some practice problems. I'm here if you need help!`
                                      : `Good effort on ${subject.assignment}! To reach the next level, focus on [specific concept]. Keep up the good work!`;
                                    
                                    setSelectedStudent({
                                      ...student,
                                      prefilledMessage: feedbackMessage
                                    });
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

      {activeTab === 'classes' && (
        <div className="dashboard-grid">
          <div className="classes-grid">
            {classes.map(({ class: cls, student_count, assignment_count }) => (
              <div key={cls.id} className="card class-card">
                <h3>{cls.name}</h3>
                <p className="class-subject">{cls.subject}</p>
                <div className="class-stats">
                  <div className="stat">
                    <span className="stat-label">Students:</span>
                    <span className="stat-value">{student_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Assignments:</span>
                    <span className="stat-value">{assignment_count}</span>
                  </div>
                </div>
              </div>
            ))}
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