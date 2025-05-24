// ConfigService.ts
import axios from 'axios';
import  API_BASE_URL  from '../services/api';
// Configuration de l'API

interface SystemConfig {
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
}

class ConfigService {
  private static readonly API_URL = `${API_BASE_URL}/admin/config`;

  /**
   * Récupère la configuration système
   */
  static async getSystemConfig(): Promise<SystemConfig> {
    try {
      const response = await axios.get(this.API_URL);
      return response.data;
    } catch (error) {
      console.error('Error in getSystemConfig:', error);
      throw error;
    }
  }

  /**
   * Met à jour la configuration système
   */
  static async updateSystemConfig(config: SystemConfig): Promise<SystemConfig> {
    try {
      const response = await axios.put(this.API_URL, config);
      return response.data;
    } catch (error) {
      console.error('Error in updateSystemConfig:', error);
      throw error;
    }
  }

  /**
   * Réinitialise la configuration système aux valeurs par défaut
   */
  static async resetSystemConfig(): Promise<SystemConfig> {
    try {
      const response = await axios.post(`${this.API_URL}/reset`);
      return response.data;
    } catch (error) {
      console.error('Error in resetSystemConfig:', error);
      throw error;
    }
  }

  /**
   * Récupère un seul paramètre de configuration
   */
  static async getConfigParam(paramName: string): Promise<any> {
    try {
      const response = await axios.get(`${this.API_URL}/param/${paramName}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getConfigParam(${paramName}):`, error);
      throw error;
    }
  }

  /**
   * Met à jour un seul paramètre de configuration
   */
  static async updateConfigParam(paramName: string, value: any): Promise<SystemConfig> {
    try {
      const response = await axios.patch(`${this.API_URL}/param/${paramName}`, { value });
      return response.data;
    } catch (error) {
      console.error(`Error in updateConfigParam(${paramName}):`, error);
      throw error;
    }
  }

  /**
   * Exporte la configuration
   */
  static async exportConfig(): Promise<Blob> {
    try {
      const response = await axios.get(`${this.API_URL}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error in exportConfig:', error);
      throw error;
    }
  }

  /**
   * Importe une configuration
   */
  static async importConfig(configFile: File): Promise<SystemConfig> {
    try {
      const formData = new FormData();
      formData.append('configFile', configFile);

      const response = await axios.post(`${this.API_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in importConfig:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le mode maintenance est actif
   */
  static async isMaintenanceMode(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.API_URL}/maintenance`);
      return response.data.maintenance;
    } catch (error) {
      console.error('Error in isMaintenanceMode:', error);
      throw error;
    }
  }

  /**
   * Active ou désactive le mode maintenance
   */
  static async toggleMaintenanceMode(active: boolean): Promise<SystemConfig> {
    try {
      const response = await axios.post(`${this.API_URL}/maintenance`, { active });
      return response.data;
    } catch (error) {
      console.error('Error in toggleMaintenanceMode:', error);
      throw error;
    }
  }
}

export { ConfigService, type SystemConfig };