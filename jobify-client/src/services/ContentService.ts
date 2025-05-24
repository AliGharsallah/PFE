// ContentService.ts
import axios from 'axios';
import API_BASE_URL  from './api';

interface Content {
  id: number;
  type: string;
  titre: string;
  contenu: string;
  statut: string;
  derniereMaj: string;
  auteur?: string;
}

class ContentService {
  private static readonly API_URL = `${API_BASE_URL}/admin/content`;

  /**
   * Récupère tous les contenus
   */
  static async getAllContent(): Promise<Content[]> {
    try {
      const response = await axios.get(this.API_URL);
      return response.data;
    } catch (error) {
      console.error('Error in getAllContent:', error);
      throw error;
    }
  }

  /**
   * Récupère un contenu par son ID
   */
  static async getContentById(id: number): Promise<Content> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getContentById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau contenu
   */
  static async createContent(content: Omit<Content, 'id' | 'derniereMaj'>): Promise<Content> {
    try {
      const response = await axios.post(this.API_URL, content);
      return response.data;
    } catch (error) {
      console.error('Error in createContent:', error);
      throw error;
    }
  }

  /**
   * Met à jour un contenu existant
   */
  static async updateContent(id: number, content: Partial<Content>): Promise<Content> {
    try {
      const response = await axios.put(`${this.API_URL}/${id}`, content);
      return response.data;
    } catch (error) {
      console.error(`Error in updateContent(${id}):`, error);
      throw error;
    }
  }

  /**
   * Supprime un contenu
   */
  static async deleteContent(id: number): Promise<void> {
    try {
      await axios.delete(`${this.API_URL}/${id}`);
    } catch (error) {
      console.error(`Error in deleteContent(${id}):`, error);
      throw error;
    }
  }

  /**
   * Récupère les contenus par type
   */
  static async getContentByType(type: string): Promise<Content[]> {
    try {
      const response = await axios.get(`${this.API_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getContentByType(${type}):`, error);
      throw error;
    }
  }

  /**
   * Récupère les contenus par statut
   */
  static async getContentByStatus(status: string): Promise<Content[]> {
    try {
      const response = await axios.get(`${this.API_URL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getContentByStatus(${status}):`, error);
      throw error;
    }
  }

  /**
   * Change le statut d'un contenu
   */
  static async changeContentStatus(id: number, status: string): Promise<Content> {
    try {
      const response = await axios.patch(`${this.API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error in changeContentStatus(${id}):`, error);
      throw error;
    }
  }

  /**
   * Recherche des contenus
   */
  static async searchContent(query: string): Promise<Content[]> {
    try {
      const response = await axios.get(`${this.API_URL}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error in searchContent(${query}):`, error);
      throw error;
    }
  }

  /**
   * Publie un contenu
   */
  static async publishContent(id: number): Promise<Content> {
    try {
      const response = await axios.post(`${this.API_URL}/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error(`Error in publishContent(${id}):`, error);
      throw error;
    }
  }

  /**
   * Dépublie un contenu
   */
  static async unpublishContent(id: number): Promise<Content> {
    try {
      const response = await axios.post(`${this.API_URL}/${id}/unpublish`);
      return response.data;
    } catch (error) {
      console.error(`Error in unpublishContent(${id}):`, error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des modifications d'un contenu
   */
  static async getContentHistory(id: number): Promise<object[]> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error in getContentHistory(${id}):`, error);
      throw error;
    }
  }
}

export { ContentService, type Content };