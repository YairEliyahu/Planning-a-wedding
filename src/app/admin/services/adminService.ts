import { AdminUser, UserStats } from '../types/admin';

const API_BASE = '/api';

export class AdminService {
  private static async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User Management
  static async getAllUsers(): Promise<AdminUser[]> {
    return this.fetchWithAuth<AdminUser[]>(`${API_BASE}/admin/users`);
  }

  static async getUserById(id: string): Promise<AdminUser> {
    return this.fetchWithAuth<AdminUser>(`${API_BASE}/admin/users/${id}`);
  }

  static async deleteUser(id: string): Promise<{ success: boolean }> {
    return this.fetchWithAuth(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async resetUserPassword(id: string): Promise<{ success: boolean; newPassword: string }> {
    return this.fetchWithAuth(`${API_BASE}/admin/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  static async toggleUserStatus(id: string): Promise<{ success: boolean; isActive: boolean }> {
    return this.fetchWithAuth(`${API_BASE}/admin/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  static async updateUserRole(id: string, role: 'user' | 'admin'): Promise<{ success: boolean }> {
    return this.fetchWithAuth(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  static async bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; deletedCount: number }> {
    return this.fetchWithAuth(`${API_BASE}/admin/users/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  // Statistics
  static async getUserStats(): Promise<UserStats> {
    return this.fetchWithAuth<UserStats>(`${API_BASE}/admin/stats`);
  }

  static async getActivityLog(limit: number = 50): Promise<any[]> {
    return this.fetchWithAuth<any[]>(`${API_BASE}/admin/activity?limit=${limit}`);
  }

  // Search and Filtering
  static async searchUsers(query: string): Promise<AdminUser[]> {
    return this.fetchWithAuth<AdminUser[]>(`${API_BASE}/admin/users/search?q=${encodeURIComponent(query)}`);
  }

  static async filterUsers(filters: Record<string, any>): Promise<AdminUser[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchWithAuth<AdminUser[]>(`${API_BASE}/admin/users/filter?${queryParams.toString()}`);
  }

  // Export functionality
  static async exportUsersToCSV(): Promise<Blob> {
    const response = await fetch(`${API_BASE}/admin/export/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
} 