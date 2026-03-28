import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const login = (email, password) => 
  api.post('/login', { email, password });

export const register = (email, password, name, role) => 
  api.post('/register', { email, password, name, role });

export const logout = () => 
  api.post('/logout');

export const getCurrentUser = () => 
  api.get('/me');

// Candidate endpoints
export const getCandidates = () => 
  api.get('/candidates');

export const createCandidate = (data) => 
  api.post('/candidates', data);

export const searchCandidates = (query, limit = 5) => 
  api.post('/candidates/search', { query, limit });

export const getCandidate = (id) => 
  api.get(`/candidates/${id}`);

// Board endpoints
export const getBoards = () => 
  api.get('/boards');

export const createBoard = (data) => 
  api.post('/boards', data);

export const searchBoards = (query, limit = 5) => 
  api.post('/boards/search', { query, limit });

export const getBoard = (id) => 
  api.get(`/boards/${id}`);

export const matchCandidatesToBoard = (boardId, limit = 5) => 
  api.post(`/boards/${boardId}/match-candidates`, { limit });

export default api;
