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
  register: (userData: { name: string; email: string; password: string; role?: string }) => 
    API.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => 
    API.post('/auth/login', credentials),
};

// Job services
export const jobService = {
  getAllJobs: () => API.get('/Offers'),
  getMyJobs: () => API.get('/Offers/my-jobs'),
  getJob: (id: string) => API.get(`/Offers/${id}`),
  createJob: (jobData: { 
    title: string; 
    company: string; 
    description: string; 
    location?: string;
    requirements?: string[]; 
    technicalSkills?: string[];
    testCriteria?: {
      topics: string[];
      duration: number;
      numberOfQuestions: number;
    };
    status?: string;
  }) => API.post('/Offers', jobData),
  updateJob: (id: string, jobData: { 
    title?: string; 
    company?: string;
    description?: string; 
    location?: string;
    requirements?: string[]; 
    technicalSkills?: string[];
    testCriteria?: {
      topics?: string[];
      duration?: number;
      numberOfQuestions?: number;
    };
    status?: string;
  }) => API.patch(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => API.delete(`/jobs/${id}`),
};

// Application services
export const applicationService = {
  applyForJob: (jobId: string, formData: FormData) => {
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
  getJobApplications: (jobId: string) => API.get(`/applications/job/${jobId}`),
  getApplication: (id: string) => API.get(`/applications/${id}`),
  updateApplicationStatus: (id: string, status: string) => 
    API.patch(`/applications/${id}/status`, { status }),
};

// Technical test services
export const testService = {
  createTest: (applicationId: string) => 
    API.post(`/tests/applications/${applicationId}/create`),
  getTest: (testId: string) => 
    API.get(`/tests/${testId}`),
  startTest: (testId: string) => 
    API.patch(`/tests/${testId}/start`),
  submitTest: (testId: string, answers: string[]) => 
    API.post(`/tests/${testId}/submit`, { answers }),
  getTestResults: (testId: string) => 
    API.get(`/tests/${testId}/results`),
};

export default API;