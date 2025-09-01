import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useRiwayatPengajuanStore = defineStore('riwayatPengajuan', {
  state: () => ({
    riwayatList: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
    filters: {
      search: '',
      status: '',
    },
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Fetches the user's submission history based on current filters and pagination.
     */
    async fetchRiwayat(page = 1) {
      this.loading = true;
      this.error = null;
      const userStore = useUserStore();
      
      if (!userStore.user?.unique_id) {
        this.error = 'User not found. Cannot fetch history.';
        toast.error(this.error);
        this.loading = false;
        return;
      }

      try {
        const params = {
          page,
          search: this.filters.search || undefined,
          status: this.filters.status || undefined,
          user_id: userStore.user.unique_id, // Always filter by the current user
        };
        const { data } = await apiClient.get('/pengajuan', { params });
        this.riwayatList = data.data || [];
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        this.error = e.response?.data?.message || 'Gagal memuat riwayat pengajuan.';
        logger.error('Failed to fetch riwayat pengajuan:', e);
        toast.error(this.error);
        this.riwayatList = []; // Ensure list is empty on error
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cancels a pending submission.
     * @param {string} id - The ID of the pengajuan to cancel.
     */
    async cancelPengajuan(id) {
      try {
        await apiClient.delete(`/pengajuan/${id}`);
        toast.success('Pengajuan berhasil dibatalkan.');
        // Refresh the current page to reflect the change
        await this.fetchRiwayat(this.pagination.current_page);
      } catch (e) {
        const errorMsg = e.response?.data?.message || 'Gagal membatalkan pengajuan.';
        logger.error('Failed to cancel pengajuan:', e);
        toast.error(errorMsg);
      }
    },
    
    /**
     * Fetches the full detail for a single submission.
     * @param {string} id - The ID of the pengajuan.
     * @returns {object|null} The detailed pengajuan data or null on error.
     */
    async fetchDetail(id) {
        try {
            const { data } = await apiClient.get(`/pengajuan/${id}`);
            return data.data;
        } catch(e) {
            toast.error('Gagal memuat detail pengajuan.');
            return null;
        }
    }
  },
});