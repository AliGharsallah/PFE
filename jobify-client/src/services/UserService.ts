// UserService.ts
import axios from 'axios';
import  API_BASE_URL  from './api';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dateInscription: string;
  statut: string;
}

interface UserFormData {
  email: string;
  nom: string;
  prenom: string;
  role: string;
  statut: string;
}

class UserService {
  private static readonly API_URL = `${API_BASE_URL}/admin/users`;

  /**
   * Récupère tous les utilisateurs
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(this.API_URL);
      return response.data;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async getUserById(id: number): Promise<User> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getUserById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async createUser(userData: UserFormData): Promise<User> {
    try {
      const response = await axios.post(this.API_URL, userData);
      return response.data;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Met à jour un utilisateur existant
   */
  static async updateUser(id: number, userData: UserFormData): Promise<User> {
    try {
      const response = await axios.put(`${this.API_URL}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error in updateUser(${id}):`, error);
      throw error;
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(`${this.API_URL}/${id}`);
    } catch (error) {
      console.error(`Error in deleteUser(${id}):`, error);
      throw error;
    }
  }

  /**
   * Recherche des utilisateurs par critères
   */
  static async searchUsers(criteria: object): Promise<User[]> {
    try {
      const response = await axios.post(`${this.API_URL}/search`, criteria);
      return response.data;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  /**
   * Change le statut d'un utilisateur (actif/inactif)
   */
  static async changeUserStatus(id: number, status: string): Promise<User> {
    try {
      const response = await axios.patch(`${this.API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error in changeUserStatus(${id}):`, error);
      throw error;
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  static async resetUserPassword(id: number): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.API_URL}/${id}/reset-password`);
      return response.data;
    } catch (error) {
      console.error(`Error in resetUserPassword(${id}):`, error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques sur les utilisateurs
   */
  static async getUserStats(): Promise<object> {
    try {
      const response = await axios.get(`${this.API_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
}

export { UserService, type User, type UserFormData };