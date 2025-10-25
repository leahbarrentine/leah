import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentAPI = {
  getDashboard: (studentId) => api.get(`/students/${studentId}/dashboard`),
  getPerformance: (studentId) => api.get(`/students/${studentId}/performance`),
  getGrades: (studentId) => api.get(`/students/${studentId}/grades`),
  getPrediction: (studentId) => api.get(`/predictions/${studentId}`),
  saveDraft: (assignmentId, data) => api.post(`/assignments/${assignmentId}/save-draft`, data),
  submitAssignment: (assignmentId, data) => api.post(`/assignments/${assignmentId}/submit`, data),
  getSubmission: (assignmentId, studentId) => api.get(`/assignments/${assignmentId}/submission/${studentId}`)
};

export const teacherAPI = {
  getDashboard: (teacherId) => api.get(`/teachers/${teacherId}/dashboard`),
  getStudents: (teacherId) => api.get(`/teachers/${teacherId}/students`),
  getGradingQueue: (teacherId) => api.get(`/teachers/${teacherId}/grading-queue`),
  gradeSubmission: (gradeId, data) => api.post(`/grades/${gradeId}/grade`, data),
  getAtRiskStudents: (teacherId) => api.get(`/predictions/at-risk/${teacherId}`)
};

export const messageAPI = {
  getMessages: (userId, userType) => api.get('/messages', { params: { user_id: userId, user_type: userType } }),
  getConversations: (userId, userType) => api.get('/conversations', { params: { user_id: userId, user_type: userType } }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

export const gradeAPI = {
  createGrade: (data) => api.post('/grades', data),
};

export const generalAPI = {
  getStudents: () => api.get('/students'),
  getTeachers: () => api.get('/teachers'),
  getClasses: () => api.get('/classes'),
};

export default api;