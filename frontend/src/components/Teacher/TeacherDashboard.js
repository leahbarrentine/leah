import React, { useState, useEffect } from 'react';
import { teacherAPI, studentAPI, messageAPI } from '../../api';
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
  const [allStudents, setAllStudents] = useState([]);
  const [allStudentsPerformance, setAllStudentsPerformance] = useState({});
  const [feedbackModal, setFeedbackModal] = useState(null); // { student, subject, message }
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [expandedRiskLevels, setExpandedRiskLevels] = useState({
    high: false,
    medium: false,
    low: false
  });
  const [gradingQueue, setGradingQueue] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showNotSubmitted, setShowNotSubmitted] = useState(false);
  const [reminderModal, setReminderModal] = useState(null); // { student, assignment, dueDate }
  const [gradingFilter, setGradingFilter] = useState('all'); // 'all' or 'assignment'
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState(''); // specific assignment title
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadAllStudents();
    loadGradingQueue();
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations(userId, 'teacher');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

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

  const loadAllStudents = async () => {
    try {
      const { generalAPI } = await import('../../api');
      const response = await generalAPI.getStudents();
      setAllStudents(response.data);
      
      // Load performance data for all students
      const performanceData = {};
      for (const student of response.data) {
        try {
          const perfResponse = await studentAPI.getPerformance(student.id);
          performanceData[student.id] = perfResponse.data;
        } catch (error) {
          console.error(`Error loading performance for student ${student.id}:`, error);
        }
      }
      setAllStudentsPerformance(performanceData);
    } catch (error) {
      console.error('Error loading all students:', error);
    }
  };

  const loadGradingQueue = async () => {
    try {
      const response = await teacherAPI.getGradingQueue(userId);
      setGradingQueue(response.data);
    } catch (error) {
      console.error('Error loading grading queue:', error);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !gradeInput) {
      alert('Please enter a grade');
      return;
    }

    const score = parseFloat(gradeInput);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }

    try {
      await teacherAPI.gradeSubmission(selectedSubmission.grade.id, { score });
      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      setGradeInput('');
      loadGradingQueue(); // Reload the queue
    } catch (error) {
      console.error('Error submitting grade:', error);
      alert('Failed to submit grade. Please try again.');
    }
  };

  // Helper function to calculate risk level for a student based on performance
  const calculateRiskLevel = (studentId) => {
    const perfData = allStudentsPerformance[studentId];
    if (!perfData || perfData.length === 0) return 'unknown';
    
    const latestPerf = perfData[perfData.length - 1];
    const avgGrade = latestPerf.avg_grade || 0;
    const completionRate = latestPerf.completion_rate || 0;
    
    // Check if student is in at_risk_students list
    const atRiskStudent = dashboard?.at_risk_students?.find(
      ({ student }) => student.id === studentId
    );
    
    if (atRiskStudent) {
      return atRiskStudent.prediction.risk_level;
    }
    
    // Calculate risk level based on performance metrics
    if (avgGrade < 60 || completionRate < 0.6) return 'high';
    if (avgGrade < 75 || completionRate < 0.8) return 'medium';
    return 'low';
  };

  const handleSendFeedback = async () => {
    if (!feedbackModal) return;
    
    try {
      const { messageAPI } = await import('../../api');
      await messageAPI.sendMessage({
        sender_id: userId,
        sender_type: 'teacher',
        recipient_id: feedbackModal.student.id,
        recipient_type: 'student',
        content: feedbackModal.message
      });
      alert(`Feedback sent to ${feedbackModal.student.name}!`);
      setFeedbackModal(null);
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback. Please try again.');
    }
  };

  const handleSendReminder = async () => {
    if (!reminderModal) return;
    
    try {
      const { messageAPI } = await import('../../api');
      await messageAPI.sendMessage({
        sender_id: userId,
        sender_type: 'teacher',
        recipient_id: reminderModal.student.id,
        recipient_type: 'student',
        content: reminderModal.message
      });
      alert(`Reminder sent to ${reminderModal.student.name}!`);
      setReminderModal(null);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="container">Error loading dashboard</div>;
  }

  const { teacher, at_risk_students, classes } = dashboard;
  
  // Calculate risk level counts for ALL students
  const riskCounts = {
    high: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'high').length,
    medium: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'medium').length,
    low: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'low').length
  };
  
  // Group students by risk level
  const studentsByRisk = {
    high: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'high'),
    medium: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'medium'),
    low: at_risk_students.filter(({ prediction }) => prediction.risk_level === 'low')
  };
  
  // Total student count
  const totalStudents = at_risk_students.length;
  
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

  // Calculate notification counts
  const ungradedCount = gradingQueue.length;
  const unreadMessageCount = conversations.reduce((total, conv) => {
    const incomingUnread = conv.messages.filter(m => 
      !m.read && m.recipient_id === userId && m.recipient_type === 'teacher'
    ).length;
    return total + incomingUnread;
  }, 0);

  return (
    <>
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout}
        userType="teacher"
        userName={teacher.name}
        gradingCount={ungradedCount}
        messageCount={unreadMessageCount}
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
                    {pendingGradingTasks.slice(0, 3).map((task, idx) => (
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
                    {completedTaskObjects.slice(0, showAllCompleted ? completedTaskObjects.length : 3).map((task, idx) => (
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
                  {completedTaskObjects.length > 3 && (
                    <button 
                      className="expand-button"
                      onClick={() => setShowAllCompleted(!showAllCompleted)}
                    >
                      {showAllCompleted ? 'Show Less' : `Show ${completedTaskObjects.length - 3} More`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        
          {/* Risk Level Summary - Always show if there are students */}
          {totalStudents > 0 && (
            <div className="risk-summary-section">
              <h3>Student Overview</h3>
              <div className="risk-counters">
                <div 
                  className="risk-counter high-risk-counter"
                  onClick={() => setExpandedRiskLevels({...expandedRiskLevels, high: !expandedRiskLevels.high})}
                >
                  <div className="counter-content">
                    <span className="counter-number">{riskCounts.high}</span>
                    <span className="counter-label">High Risk</span>
                  </div>
                  <span className="expand-icon">{expandedRiskLevels.high ? '▼' : '▶'}</span>
                </div>
                <div 
                  className="risk-counter medium-risk-counter"
                  onClick={() => setExpandedRiskLevels({...expandedRiskLevels, medium: !expandedRiskLevels.medium})}
                >
                  <div className="counter-content">
                    <span className="counter-number">{riskCounts.medium}</span>
                    <span className="counter-label">Medium Risk</span>
                  </div>
                  <span className="expand-icon">{expandedRiskLevels.medium ? '▼' : '▶'}</span>
                </div>
                <div 
                  className="risk-counter low-risk-counter"
                  onClick={() => setExpandedRiskLevels({...expandedRiskLevels, low: !expandedRiskLevels.low})}
                >
                  <div className="counter-content">
                    <span className="counter-number">{riskCounts.low}</span>
                    <span className="counter-label">Low Risk</span>
                  </div>
                  <span className="expand-icon">{expandedRiskLevels.low ? '▼' : '▶'}</span>
                </div>
              </div>
            </div>
          )}
        
          {totalStudents === 0 ? (
            <div className="card">
              <p className="no-data">
                No students found in your classes.
              </p>
            </div>
          ) : (
            <>
              {/* High Risk Students */}
              {expandedRiskLevels.high && studentsByRisk.high.length > 0 && (
                <div className="risk-section">
                  <h3 className="risk-section-title high-risk-title">High Risk Students</h3>
                  <div className="dashboard-grid">
              {studentsByRisk.high.map(({ student, prediction }) => (
                <div key={student.id} className="at-risk-card high-risk">
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
                                    
                                    setFeedbackModal({
                                      student,
                                      subject,
                                      message: feedbackMessage
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
                </div>
              )}

              {/* Medium Risk Students */}
              {expandedRiskLevels.medium && studentsByRisk.medium.length > 0 && (
                <div className="risk-section">
                  <h3 className="risk-section-title medium-risk-title">Medium Risk Students</h3>
                  <div className="dashboard-grid">
                    {studentsByRisk.medium.map(({ student, prediction }) => (
                      <div key={student.id} className="at-risk-card medium-risk">
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

                        <button 
                          className="button-primary"
                          onClick={() => setSelectedStudent(student)}
                        >
                          Send Message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Risk Students */}
              {expandedRiskLevels.low && studentsByRisk.low.length > 0 && (
                <div className="risk-section">
                  <h3 className="risk-section-title low-risk-title">Low Risk Students</h3>
                  <div className="dashboard-grid">
                    {studentsByRisk.low.map(({ student, prediction }) => (
                      <div key={student.id} className="at-risk-card low-risk">
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

                        <button 
                          className="button-primary"
                          onClick={() => setSelectedStudent(student)}
                        >
                          Send Message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
                            
                            setFeedbackModal({
                              student,
                              subject,
                              message: feedbackMessage
                            });
                          }}
                        >
                          Send Feedback
                        </button>
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

      {activeTab === 'performance' && (
        <div className="performance-overviews-section">
          <h2>Performance Overviews</h2>
          <p className="section-description">Monitor all student performance trends and metrics</p>
          
          {allStudents.length === 0 ? (
            <div className="empty-state">
              <p>No students found</p>
            </div>
          ) : (
            <div className="performance-grid">
              {allStudents.map(student => {
                const riskLevel = calculateRiskLevel(student.id);
                return (
                <div key={student.id} className="performance-card">
                  <div className="student-header">
                    <div className="student-info-section">
                      <h3 className="student-name">{student.name}</h3>
                      <p className="student-email">{student.email}</p>
                    </div>
                    {riskLevel !== 'unknown' && (
                      <span className={`risk-badge ${riskLevel}`}>
                        {riskLevel} risk
                      </span>
                    )}
                  </div>
                  
                  {allStudentsPerformance[student.id] && allStudentsPerformance[student.id].length > 0 ? (
                    <>
                      <div className="performance-chart-container">
                        <h4>Performance Trend</h4>
                        <PerformanceChart data={allStudentsPerformance[student.id]} />
                      </div>
                      
                      <div className="performance-metrics">
                        <div className="metric">
                          <span className="metric-label">Current Average</span>
                          <span className="metric-value">
                            {allStudentsPerformance[student.id][allStudentsPerformance[student.id].length - 1]?.avg_grade 
                              ? `${allStudentsPerformance[student.id][allStudentsPerformance[student.id].length - 1].avg_grade.toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Completion Rate</span>
                          <span className="metric-value">
                            {allStudentsPerformance[student.id][allStudentsPerformance[student.id].length - 1]?.completion_rate
                              ? `${(allStudentsPerformance[student.id][allStudentsPerformance[student.id].length - 1].completion_rate * 100).toFixed(0)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-performance-data">
                      <p>No performance data available yet</p>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="grading-window-section">
          <h2>Upcoming</h2>
          <p className="section-description">Review and grade submitted student work</p>
          
          {(() => {
            // Separate submitted from not submitted assignments
            const submittedQueue = gradingQueue.filter(submission => 
              submission.grade.submission_status === 'submitted'
            );
            const notSubmittedQueue = gradingQueue.filter(submission => 
              submission.grade.submission_status === 'not_started' || 
              submission.grade.submission_status === 'in_progress'
            );
            
            return (
              <>
                {submittedQueue.length === 0 && notSubmittedQueue.length === 0 ? (
                  <div className="empty-state">
                    <p>No submissions to grade at this time. Great job staying on top of grading!</p>
                  </div>
                ) : selectedSubmission ? (
            <div className="grading-interface">
              <button className="back-button" onClick={() => setSelectedSubmission(null)}>
                ← Back to Queue
              </button>
              
              <div className="grading-card">
                <div className="grading-header">
                  <div>
                    <h3>{selectedSubmission.assignment.title}</h3>
                    <p className="assignment-subject">{selectedSubmission.assignment.subject}</p>
                  </div>
                  <div className="student-info-badge">
                    <p className="student-name">{selectedSubmission.student.name}</p>
                    <p className="student-email">{selectedSubmission.student.email}</p>
                  </div>
                </div>
                
                <div className="assignment-details">
                  <div className="detail-row">
                    <span className="label">Due Date:</span>
                    <span className="value">{new Date(selectedSubmission.assignment.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submitted:</span>
                    <span className="value">{new Date(selectedSubmission.grade.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Max Points:</span>
                    <span className="value">{selectedSubmission.assignment.max_points}</span>
                  </div>
                </div>
                
                <div className="submission-content-section">
                  <h4>Student Work</h4>
                  <div className="submission-content">
                    {selectedSubmission.grade.submission_content || 'No content submitted'}
                  </div>
                </div>
                
                <div className="feedback-section">
                  <h4>Leave Feedback</h4>
                  <p className="feedback-description">
                    Feedback will be sent as a direct message to {selectedSubmission.student.name} tagged with the assignment name.
                  </p>
                  <textarea
                    className="feedback-input-textarea"
                    placeholder="Enter feedback for the student..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="grading-form">
                  <h4>Enter Grade</h4>
                  <div className="grade-input-group">
                    <input
                      type="number"
                      className="grade-input"
                      placeholder="Enter score (0-100)"
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="input-suffix">/ {selectedSubmission.assignment.max_points}</span>
                  </div>
                  <button 
                    className="submit-grade-button"
                    onClick={async () => {
                      await handleGradeSubmission();
                      
                      // Send feedback as DM if provided
                      if (feedbackInput.trim()) {
                        try {
                          await messageAPI.sendMessage({
                            sender_id: userId,
                            sender_type: 'teacher',
                            recipient_id: selectedSubmission.student.id,
                            recipient_type: 'student',
                            content: `Feedback for ${selectedSubmission.assignment.title}:\n\n${feedbackInput}`
                          });
                        } catch (error) {
                          console.error('Error sending feedback:', error);
                        }
                      }
                      
                      setFeedbackInput('');
                    }}
                  >
                    Submit Grade
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Needs Grading - Submitted Assignments */}
              {submittedQueue.length > 0 && (
                <div className="submitted-queue-section">
                  <div className="grading-section-header">
                    <h3 className="queue-section-title">Needs Grading ({submittedQueue.length})</h3>
                    <div className="grading-filter-controls">
                      <select 
                        className="grading-filter-select"
                        value={gradingFilter}
                        onChange={(e) => {
                          setGradingFilter(e.target.value);
                          if (e.target.value === 'all') {
                            setSelectedAssignmentFilter('');
                          }
                        }}
                      >
                        <option value="all">See All</option>
                        <option value="assignment">Sort by Assignment</option>
                      </select>
                      
                      {gradingFilter === 'assignment' && (() => {
                        // Get unique assignments that have submissions
                        const availableAssignments = [...new Set(
                          submittedQueue.map(sub => sub.assignment.title)
                        )];
                        
                        return (
                          <select 
                            className="assignment-filter-select"
                            value={selectedAssignmentFilter}
                            onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                          >
                            <option value="">Select Assignment</option>
                            {availableAssignments.map((title, idx) => (
                              <option key={idx} value={title}>{title}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="grading-cards-grid">
                    {submittedQueue
                      .filter(submission => {
                        if (gradingFilter === 'all') return true;
                        if (gradingFilter === 'assignment' && selectedAssignmentFilter) {
                          return submission.assignment.title === selectedAssignmentFilter;
                        }
                        return false;
                      })
                      .map((submission, index) => {
                      const dueDate = new Date(submission.assignment.due_date);
                      const submittedDate = new Date(submission.grade.submitted_at);
                      const isLate = submittedDate > dueDate;
                      
                      return (
                        <div key={index} className="grading-card-item">
                          <div className="grading-card-header">
                            <h4>{submission.assignment.title}: {submission.student.name}</h4>
                          </div>
                          <div className="grading-card-body">
                            <div className="submitted-info">
                              <span className="info-label">Submitted:</span>
                              <span className="info-value">{submittedDate.toLocaleDateString()}</span>
                            </div>
                            <div className={`submission-status ${isLate ? 'late' : 'on-time'}`}>
                              ({isLate ? 'Late' : 'On Time'})
                            </div>
                          </div>
                          <button 
                            className="see-more-btn"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setGradeInput('');
                              setFeedbackInput('');
                            }}
                          >
                            See More
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Not Submitted - Collapsible Section */}
              {notSubmittedQueue.length > 0 && (
                <div className="not-submitted-section">
                  <button 
                    className="expand-not-submitted-button"
                    onClick={() => setShowNotSubmitted(!showNotSubmitted)}
                  >
                    {showNotSubmitted ? '▼' : '▶'} Not Submitted ({notSubmittedQueue.length})
                  </button>
                  
                  {showNotSubmitted && (
                    <div className="not-submitted-list">
                      {notSubmittedQueue.map((submission, index) => {
                        const dueDate = new Date(submission.assignment.due_date);
                        const currentDate = new Date();
                        const diffTime = dueDate - currentDate;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isOverdue = diffDays < 0;
                        
                        return (
                          <div key={index} className="not-submitted-item">
                            <div className="not-submitted-header">
                              <h3>{submission.assignment.title}</h3>
                              <span className="subject-badge">{submission.assignment.subject}</span>
                            </div>
                            <div className="not-submitted-details">
                              <div className="detail">
                                <span className="label">Student: </span>
                                <span 
                                  className="value student-name-link"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudent(submission.student);
                                  }}
                                >
                                  {submission.student.name}
                                </span>
                              </div>
                              <div className="detail">
                                <span className="label">Status: </span>
                                <span className="value status-not-submitted">
                                  {submission.grade.submission_status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Reminder Box */}
                            <div className="reminder-box">
                              <h4>Send Reminder</h4>
                              <div className="reminder-dates">
                                <div className="date-info">
                                  <span className="date-label">Due Date:</span>
                                  <span className="date-value">{dueDate.toLocaleDateString()}</span>
                                </div>
                                <div className="date-info">
                                  <span className="date-label">Current Date:</span>
                                  <span className="date-value">{currentDate.toLocaleDateString()}</span>
                                </div>
                                <div className="date-info">
                                  <span className="date-label">{isOverdue ? 'Days Overdue:' : 'Days to Finish:'}</span>
                                  <span className={`date-value ${isOverdue ? 'overdue' : 'upcoming'}`}>
                                    {isOverdue ? Math.abs(diffDays) : diffDays} days
                                  </span>
                                </div>
                              </div>
                              <button 
                                className="send-reminder-btn"
                                onClick={() => {
                                  const reminderMessage = isOverdue
                                    ? `Hi ${submission.student.name}, I noticed that ${submission.assignment.title} is now ${Math.abs(diffDays)} days overdue. Please submit your work as soon as possible. Let me know if you need any help or an extension.`
                                    : `Hi ${submission.student.name}, this is a gentle reminder that ${submission.assignment.title} is due in ${diffDays} days (${dueDate.toLocaleDateString()}). Please make sure to submit your work on time. Let me know if you have any questions!`;
                                  
                                  setReminderModal({
                                    student: submission.student,
                                    assignment: submission.assignment,
                                    dueDate: dueDate,
                                    message: reminderMessage
                                  });
                                }}
                              >
                                Send Reminder
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
              </>
            );
          })()}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Feedback for {feedbackModal.student.name}</h3>
            <p className="feedback-instructions">
              Please customize the message below, especially replacing [specific concept] with the actual concept the student should focus on.
            </p>
            <textarea
              className="feedback-textarea"
              value={feedbackModal.message}
              onChange={(e) => setFeedbackModal({...feedbackModal, message: e.target.value})}
              rows={6}
            />
            <div className="modal-actions">
              <button className="button button-primary" onClick={handleSendFeedback}>
                Send Feedback
              </button>
              <button className="button button-secondary" onClick={() => setFeedbackModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModal && (
        <div className="modal-overlay" onClick={() => setReminderModal(null)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Send Reminder to {reminderModal.student.name}</h3>
            <p className="feedback-instructions">
              Customize the reminder message below before sending.
            </p>
            <textarea
              className="feedback-textarea"
              value={reminderModal.message}
              onChange={(e) => setReminderModal({...reminderModal, message: e.target.value})}
              rows={6}
            />
            <div className="modal-actions">
              <button className="button button-primary" onClick={handleSendReminder}>
                Send Reminder
              </button>
              <button className="button button-secondary" onClick={() => setReminderModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
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
              directChatOnly={true}
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