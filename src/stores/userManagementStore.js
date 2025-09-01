import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    users: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
      total: 0,
    },
    filters: {
      search: '',
      role: '',
    },
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Fetches users from the API based on current state (filters, pagination).
     */
    async fetchUsers(page = this.pagination.current_page) {
      this.loading = true;
      this.error = null;
      logger.info('Store: Fetching users', { page, filters: this.filters });

      try {
        const params = {
          page,
          search: this.filters.search || undefined,
          role: this.filters.role || undefined,
        };
        const response = await apiClient.get('/users', { params });

        // The store handles the API response structure, the component doesn't need to know.
        if (response.data.data) {
          this.users = response.data.data;
          this.pagination = response.data.meta;
        } else if (Array.isArray(response.data)) {
          this.users = response.data;
        }
        logger.success('Store: Users fetched successfully', { count: this.users.length });
      } catch (error) {
        this.error = 'Gagal memuat data user.';
        logger.error('Store: Error fetching users:', error);
        toast.error(this.error);
        // Let the component know if it was a permissions issue
        if (error.response?.status === 403) {
          this.error = 'Anda tidak memiliki akses untuk melihat data user.';
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * Saves a user (creates or updates).
     * @param {object} userData - The user data from the form.
     */
    async saveUser(userData) {
      this.loading = true;
      const isEditing = !!userData.unique_id;
      logger.info(`Store: Saving user`, { isEditing, username: userData.username });

      try {
        const payload = { ...userData };
        if (isEditing && !payload.password) {
          delete payload.password; // Don't send empty password on update
        }

        let response;
        if (isEditing) {
          response = await apiClient.put(`/users/${userData.unique_id}`, payload);
          toast.success('User berhasil diupdate');
        } else {
          response = await apiClient.post('/users', payload);
          toast.success('User berhasil ditambahkan');
        }
        
        await this.fetchUsers(); // Refresh the list after saving
        return true; // Indicate success to the component
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Gagal menyimpan user';
        logger.error('Store: Error saving user:', error);
        toast.error(errorMsg);
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deletes a user by their ID.
     * @param {object} user - The user object to delete.
     */
    async deleteUser(user) {
      logger.info(`Store: Deleting user`, { userId: user.id });
      try {
        await apiClient.delete(`/users/${user.id}`);
        toast.success(`User "${user.username}" berhasil dihapus.`);
        // Remove user from list locally for instant UI update, or just refetch
        await this.fetchUsers();
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Gagal menghapus user';
        logger.error('Store: Error deleting user:', error);
        toast.error(errorMsg);
      }
    },

    /**
     * Updates filters and triggers a fetch for the first page.
     */
    async applyFilters() {
        this.pagination.current_page = 1;
        await this.fetchUsers(1);
    }
  },
});