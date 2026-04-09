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

export const getProject = (projectId) =>
  api.get(`/projects/${projectId}`);

export const getProjectCandidates = (projectId) =>
  api.get(`/projects/${projectId}/candidates`);

export const updateProjectCandidateStatus = (projectId, projectCandidateId, status) =>
  api.patch(`/projects/${projectId}/candidates/${projectCandidateId}/status`, { status });

export const getProjectWorkQueue = (projectId) =>
  api.get(`/projects/${projectId}/work-queue`);

export const getProjectDeliverables = (projectId) =>
  api.get(`/projects/${projectId}/deliverables`);

export const updateProjectDeliverableStatus = (projectId, deliverableId, status) =>
  api.patch(`/projects/${projectId}/deliverables/${deliverableId}/status`, { status });

export const generateProjectReport = (projectId, data, config = {}) =>
  api.post(`/projects/${projectId}/generate-report`, data, config);

// SEC EDGAR endpoints
export const secSearch = (q) =>
  api.get('/sec/search', { params: { q } });

export const secCompany = (cik, ticker = '', name = '') =>
  api.get(`/sec/company/${cik}`, { params: { ticker, name } });

export const secOpportunities = () =>
  api.get('/sec/opportunities');

export const secAnalyzeProxy = (filing_url, company_name, ticker) =>
  api.post('/sec/analyze-proxy', { filing_url, company_name, ticker });

export const secProxyChat = (filing_url, company_name, ticker, messages) =>
  api.post('/sec/proxy-chat', { filing_url, company_name, ticker, messages });

// Private Board endpoints
export const cascadeBoardLookup = (company_name, url = null) =>
  api.post('/private-boards/cascade', { company_name, url });

export const searchNonprofits = (q) =>
  api.get('/private-boards/search/nonprofits', { params: { q } });

export const getNonprofitBoard = (ein) =>
  api.get(`/private-boards/nonprofit/${ein}`);

export const scrapeBoardFromUrl = (url) =>
  api.post('/private-boards/scrape-url', { url });

export const searchFormD = (q) =>
  api.get('/private-boards/search/form-d', { params: { q } });

export const getFormDBoard = (accession, name) =>
  api.get(`/private-boards/form-d/${accession}`, { params: { name } });

export const analyzePrivateBoard = (company_name, source_type, board_data) =>
  api.post('/private-boards/analyze', { company_name, source_type, board_data });

export const chatPrivateBoard = (company_name, source_type, board_data, messages) =>
  api.post('/private-boards/chat', { company_name, source_type, board_data, messages });

// Workflow endpoints
export const runBoardHealthAssessment = (projectId) =>
  api.post('/workflows/run', { project_id: projectId });

export const getWorkflowRun = (runId) =>
  api.get(`/workflows/${runId}`);

export const getLatestWorkflowRun = (projectId) =>
  api.get(`/workflows/project/${projectId}/latest`);

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
