import axios from 'axios';

// Create an Axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  register: (userData: { username: string; email: string; password: string }) => API.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => API.post('/auth/login', credentials),
};

// Job services
export const jobService = {
  getAllJobs: () => API.get('/jobs'),
  getMyJobs: () => API.get('/jobs/my-jobs'),
  getJob: (id: string) => API.get(`/jobs/${id}`),
  createJob: (jobData: { title: string; description: string; requirements: string[]; salary?: number }) => API.post('/jobs', jobData),
  updateJob: (id: string, jobData: { title?: string; description?: string; requirements?: string[]; salary?: number }) => API.patch(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => API.delete(`/jobs/${id}`),
};

// Application services
export const applicationService = {
  applyForJob: (jobId, formData) => {
    // For file uploads, we need different headers
    const token = localStorage.getItem('token');
    return axios.post(`http://localhost:5000/api/applications/jobs/${jobId}/apply`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyApplications: () => API.get('/applications/my-applications'),
  getJobApplications: (jobId) => API.get(`/applications/job/${jobId}`),
  getApplication: (id) => API.get(`/applications/${id}`),
  updateApplicationStatus: (id, status) => API.patch(`/applications/${id}/status`, { status }),
};

// Technical test services
// Mise à jour de src/services/api.ts (ajout/modification de testService)

// Technical test services
export const testService = {
  createTest: (applicationId) => API.post(`/tests/applications/${applicationId}/create`),
  getTest: (testId) => API.get(`/tests/${testId}`),
  startTest: (testId) => API.patch(`/tests/${testId}/start`),
  submitTest: (testId, answers) => API.post(`/tests/${testId}/submit`, { answers }),
  getTestResults: (testId) => API.get(`/tests/${testId}/results`),
};
export default API;