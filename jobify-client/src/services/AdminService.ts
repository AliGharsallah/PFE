
import axios from 'axios';
import API_BASE_URL from '../services/api';

interface DashboardStats {
  totalUsers: number;
  totalCandidats: number;
  totalRecruteurs: number;
  totalOffres: number;
  totalCandidatures: number;
  newUsersToday: number;
  newOffersToday: number;
  activeTests: number;
}

interface Activity {
  id: number;
  type: string;
  user: string;
  role: string;
  date: string;
}

interface SystemAlert {
  id: number;
  type: string;
  message: string;
  date: string;
}

interface DashboardOverview {
  stats: DashboardStats;
  recentActivities: Activity[];
  systemAlerts: SystemAlert[];
}

class AdminService {
  private static readonly API_URL = `${API_BASE_URL}/admin`;

  /**
   * Récupère les données pour le tableau de bord principal
   */
  static async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await axios.get(`${this.API_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités récentes sur la plateforme
   */
  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await axios.get(`${this.API_URL}/activities`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      throw error;
    }
  }

  /**
   * Récupère les alertes système
   */
  static async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await axios.get(`${this.API_URL}/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error in getSystemAlerts:', error);
      throw error;
    }
  }

  /**
   * Rafraîchit les alertes système
   */
  static async refreshSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await axios.post(`${this.API_URL}/alerts/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error in refreshSystemAlerts:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques globales
   */
  static async getStatistics(period: string = 'all'): Promise<object> {
    try {
      const response = await axios.get(`${this.API_URL}/statistics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getStatistics:', error);
      throw error;
    }
  }

  /**
   * Exporte les statistiques
   */
  static async exportStatistics(format: string = 'csv'): Promise<Blob> {
    try {
      const response = await axios.get(`${this.API_URL}/statistics/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error in exportStatistics:', error);
      throw error;
    }
  }

  /**
   * Génère un rapport système
   */
  static async generateSystemReport(reportType: string): Promise<Blob> {
    try {
      const response = await axios.post(`${this.API_URL}/reports/generate`, 
        { reportType },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error in generateSystemReport:', error);
      throw error;
    }
  }

  /**
   * Récupère les métriques de surveillance du système
   */
  static async getSystemMetrics(): Promise<object> {
    try {
      const response = await axios.get(`${this.API_URL}/monitoring/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error in getSystemMetrics:', error);
      throw error;
    }
  }

  /**
   * Récupère les logs système
   */
  static async getSystemLogs(level: string = 'all', limit: number = 100): Promise<object[]> {
    try {
      const response = await axios.get(`${this.API_URL}/monitoring/logs`, {
        params: { level, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getSystemLogs:', error);
      throw error;
    }
  }
}

export { AdminService, type DashboardOverview, type DashboardStats, type Activity, type SystemAlert };