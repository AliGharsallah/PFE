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
  register: (userData: any) => {
    // Vérifier si userData est une instance de FormData
    if (userData instanceof FormData) {
      return axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Si c'est un objet régulier, utiliser l'API normal
    return API.post('/auth/register', userData);
  },
  
  login: (credentials: { email: string; password: string }) => API.post('/auth/login', credentials),
};

// User services
export const userService = {
  // Récupérer le profil de l'utilisateur
  getProfile: () => API.get('/auth/profile'),
  
  // Mettre à jour le profil de l'utilisateur
  updateProfile: (userData: any) => API.put('/auth/profile', userData),
  
  // Télécharger une image de profil
  uploadProfileImage: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return axios.post('http://localhost:5000/api/auth/upload-profile-image', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Télécharger un logo d'entreprise (pour les recruteurs)
  uploadCompanyLogo: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return axios.post('http://localhost:5000/api/auth/upload-company-logo', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Services utilisateur pour l'administration
  getAllUsers: () => API.get('/admin/users'),
  getUserById: (id: number) => API.get(`/admin/users/${id}`),
  createUser: (userData: {
    email: string;
    nom: string;
    prenom: string;
    role: string;
    statut: string;
  }) => API.post('/admin/users', userData),
  updateUser: (id: number, userData: {
    email: string;
    nom: string;
    prenom: string;
    role: string;
    statut: string;
  }) => API.put(`/admin/users/${id}`, userData),
  deleteUser: (id: number) => API.delete(`/admin/users/${id}`),
  searchUsers: (criteria: object) => API.post('/admin/users/search', criteria),
  changeUserStatus: (id: number, status: string) => API.patch(`/admin/users/${id}/status`, { status }),
  resetUserPassword: (id: number) => API.post(`/admin/users/${id}/reset-password`),
  getUserStats: () => API.get('/admin/users/statistics'),
};

// Job services
export const jobService = {
  getAllJobs: () => API.get('/jobs'),
  getMyJobs: () => API.get('/jobs/my-jobs'),
  getJob: (id: string) => API.get(`/jobs/${id}`),
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

// Admin services - Nouveaux services pour le tableau de bord administrateur
export const adminService = {
  // Dashboard overview
  getDashboardOverview: () => 
    API.get('/admin/dashboard'),
  getRecentActivities: (limit = 10) => 
    API.get(`/admin/activities?limit=${limit}`),
  getSystemAlerts: () => 
    API.get('/admin/alerts'),
  refreshSystemAlerts: () => 
    API.post('/admin/alerts/refresh'),
  
  // Statistics
  getStatistics: (period = 'all') => 
    API.get(`/admin/statistics?period=${period}`),
  exportStatistics: (format = 'csv') => 
    API.get(`/admin/statistics/export?format=${format}`, {
      responseType: 'blob'
    }),
  
  // Reports
  generateReport: (reportType: string) => 
    API.post('/admin/reports/generate', { reportType }, {
      responseType: 'blob'
    }),
  
  // System monitoring
  getSystemMetrics: () => 
    API.get('/admin/monitoring/metrics'),
  getSystemLogs: (level = 'all', limit = 100) => 
    API.get(`/admin/monitoring/logs?level=${level}&limit=${limit}`),
};

// Configuration system services
export const configService = {
  getSystemConfig: () => 
    API.get('/admin/config'),
  updateSystemConfig: (config: {
    appName: string;
    maxUsersPerCompany: number;
    maxCandidatsPerOffre: number;
    dureeMaxEntretien: number;
    notificationsEmail: boolean;
    maintenance: boolean;
    debug: boolean;
    logLevel: string;
    deleteInactiveAccounts: number;
    backupFrequency: string;
    language: string;
    timezone: string;
  }) => 
    API.put('/admin/config', config),
  resetSystemConfig: () => 
    API.post('/admin/config/reset'),
  getConfigParam: (paramName: string) => 
    API.get(`/admin/config/param/${paramName}`),
  updateConfigParam: (paramName: string, value: any) => 
    API.patch(`/admin/config/param/${paramName}`, { value }),
  exportConfig: () => 
    API.get('/admin/config/export', {
      responseType: 'blob'
    }),
  importConfig: (configFile: File) => {
    const formData = new FormData();
    formData.append('configFile', configFile);
    return API.post('/admin/config/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  isMaintenanceMode: () => 
    API.get('/admin/config/maintenance'),
  toggleMaintenanceMode: (active: boolean) => 
    API.post('/admin/config/maintenance', { active }),
};

// AI settings services
export const aiService = {
  getAISettings: () => 
    API.get('/admin/ai/settings'),
  updateAISettings: (settings: {
    codeLlamaModel: string;
    codeLlamaVersion: string;
    codeLlamaTemp: number;
    codeLlamaMaxTokens: number;
    llama3Model: string;
    llama3Version: string;
    llama3Temp: number;
    llama3MaxTokens: number;
    iaBotVideoModel: string;
    iaBotVideoVersion: string;
    iaBotVideoSensitivity: number;
    seuilTechnique: number;
    seuilPsychologique: number;
    seuilEntretien: number;
    enableCodeEvaluation: boolean;
    enableEmotionDetection: boolean;
    enableLanguageAnalysis: boolean;
  }) => 
    API.put('/admin/ai/settings', settings),
  resetAISettings: () => 
    API.post('/admin/ai/settings/reset'),
  getModelInfo: (modelName: string) => 
    API.get(`/admin/ai/models/${modelName}`),
  getAllModels: () => 
    API.get('/admin/ai/models'),
  getAIPerformanceMetrics: (modelName?: string, period = 'month') => {
    let url = `/admin/ai/metrics?period=${period}`;
    if (modelName) url += `&model=${modelName}`;
    return API.get(url);
  },
  checkAIHealth: () => 
    API.get('/admin/ai/health'),
  refreshModelCache: (modelName?: string) => {
    let url = '/admin/ai/refresh-cache';
    if (modelName) url += `?model=${modelName}`;
    return API.post(url);
  },
  testModel: (modelName: string, testData: object) => 
    API.post(`/admin/ai/test/${modelName}`, testData),
  getTrainingRecommendations: () => 
    API.get('/admin/ai/training-recommendations'),
};

// Content management services
export const contentService = {
  getAllContent: () => 
    API.get('/admin/content'),
  getContentById: (id: number) => 
    API.get(`/admin/content/${id}`),
  createContent: (content: {
    type: string;
    titre: string;
    contenu: string;
    statut: string;
  }) => 
    API.post('/admin/content', content),
  updateContent: (id: number, content: {
    type?: string;
    titre?: string;
    contenu?: string;
    statut?: string;
  }) => 
    API.put(`/admin/content/${id}`, content),
  deleteContent: (id: number) => 
    API.delete(`/admin/content/${id}`),
  getContentByType: (type: string) => 
    API.get(`/admin/content/type/${type}`),
  getContentByStatus: (status: string) => 
    API.get(`/admin/content/status/${status}`),
  changeContentStatus: (id: number, status: string) => 
    API.patch(`/admin/content/${id}/status`, { status }),
  searchContent: (query: string) => 
    API.get(`/admin/content/search?q=${query}`),
  publishContent: (id: number) => 
    API.post(`/admin/content/${id}/publish`),
  unpublishContent: (id: number) => 
    API.post(`/admin/content/${id}/unpublish`),
  getContentHistory: (id: number) => 
    API.get(`/admin/content/${id}/history`),
};

export default API;