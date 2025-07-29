import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const todoAPI = {
  // Dashboard and analytics
  getDashboard: () => api.get('/todos/dashboard'),
  getAnalytics: (period = 30) => api.get(`/todos/analytics?period=${period}`),
  
  // User search for assignment
  searchUsers: (query) => api.get(`/todos/users/search?query=${encodeURIComponent(query)}`),
  
  // CRUD operations
  getTodos: () => api.get('/todos'),
  createTodo: (todoData) => api.post('/todos', todoData),
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
};

export default api;