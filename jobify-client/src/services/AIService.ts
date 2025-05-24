// AIService.ts
import axios from 'axios';
import  API_BASE_URL  from './api';

interface AISettings {
  // CodeLlama
  codeLlamaModel: string;
  codeLlamaVersion: string;
  codeLlamaTemp: number;
  codeLlamaMaxTokens: number;
  
  // LLaMA3
  llama3Model: string;
  llama3Version: string;
  llama3Temp: number;
  llama3MaxTokens: number;
  
  // IABotVideo
  iaBotVideoModel: string;
  iaBotVideoVersion: string;
  iaBotVideoSensitivity: number;
  
  // Seuils d'évaluation
  seuilTechnique: number;
  seuilPsychologique: number;
  seuilEntretien: number;
  
  // Intégrations
  enableCodeEvaluation: boolean;
  enableEmotionDetection: boolean;
  enableLanguageAnalysis: boolean;
}

interface AIModelInfo {
  name: string;
  version: string;
  availableVersions: string[];
  capabilities: string[];
  lastUpdated: string;
  status: string;
}

class AIService {
  private static readonly API_URL = `${API_BASE_URL}/admin/ai`;

  /**
   * Récupère les paramètres IA
   */
  static async getAISettings(): Promise<AISettings> {
    try {
      const response = await axios.get(`${this.API_URL}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error in getAISettings:', error);
      throw error;
    }
  }

  /**
   * Met à jour les paramètres IA
   */
  static async updateAISettings(settings: AISettings): Promise<AISettings> {
    try {
      const response = await axios.put(`${this.API_URL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error in updateAISettings:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les paramètres IA aux valeurs par défaut
   */
  static async resetAISettings(): Promise<AISettings> {
    try {
      const response = await axios.post(`${this.API_URL}/settings/reset`);
      return response.data;
    } catch (error) {
      console.error('Error in resetAISettings:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations sur un modèle IA spécifique
   */
  static async getModelInfo(modelName: string): Promise<AIModelInfo> {
    try {
      const response = await axios.get(`${this.API_URL}/models/${modelName}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getModelInfo(${modelName}):`, error);
      throw error;
    }
  }

  /**
   * Récupère la liste de tous les modèles IA disponibles
   */
  static async getAllModels(): Promise<AIModelInfo[]> {
    try {
      const response = await axios.get(`${this.API_URL}/models`);
      return response.data;
    } catch (error) {
      console.error('Error in getAllModels:', error);
      throw error;
    }
  }

  /**
   * Récupère les métriques de performance IA
   */
  static async getAIPerformanceMetrics(modelName?: string, period: string = 'month'): Promise<object> {
    try {
      let url = `${this.API_URL}/metrics?period=${period}`;
      if (modelName) {
        url += `&model=${modelName}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getAIPerformanceMetrics:', error);
      throw error;
    }
  }

  /**
   * Vérifie l'état de santé des services IA
   */
  static async checkAIHealth(): Promise<object> {
    try {
      const response = await axios.get(`${this.API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error in checkAIHealth:', error);
      throw error;
    }
  }

  /**
   * Rafraîchit le cache des modèles IA
   */
  static async refreshModelCache(modelName?: string): Promise<object> {
    try {
      let url = `${this.API_URL}/refresh-cache`;
      if (modelName) {
        url += `?model=${modelName}`;
      }
      const response = await axios.post(url);
      return response.data;
    } catch (error) {
      console.error('Error in refreshModelCache:', error);
      throw error;
    }
  }

  /**
   * Teste un modèle IA avec des données d'exemple
   */
  static async testModel(modelName: string, testData: object): Promise<object> {
    try {
      const response = await axios.post(`${this.API_URL}/test/${modelName}`, testData);
      return response.data;
    } catch (error) {
      console.error(`Error in testModel(${modelName}):`, error);
      throw error;
    }
  }

  /**
   * Récupère les données d'entraînement recommandées
   */
  static async getTrainingRecommendations(): Promise<object> {
    try {
      const response = await axios.get(`${this.API_URL}/training-recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error in getTrainingRecommendations:', error);
      throw error;
    }
  }
}

export { AIService, type AISettings, type AIModelInfo };