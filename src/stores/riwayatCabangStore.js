import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useRiwayatCabangStore = defineStore('riwayatCabang', {
  state: () => ({
    pengajuanList: [],
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
     * Fetches the submission history for the manager's branch.
     */
    async fetchRiwayat(page = 1) {
      this.loading = true;
      this.error = null;
      const userStore = useUserStore();
      
      const idCabang = userStore.user?.cabang?.id_cabang || userStore.user?.id_cabang;
      if (!idCabang) {
        this.error = 'ID cabang tidak ditemukan untuk manager.';
        toast.error(this.error);
        this.loading = false;
        return;
      }

      try {
        const params = {
          page,
          search: this.filters.search || undefined,
          status: this.filters.status || undefined,
          id_cabang: idCabang, // ✅ Filter by cabang ID (backend expects id_cabang)
        };
        const { data } = await apiClient.get('/pengajuan', { params });
        this.pengajuanList = data.data || [];
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        this.error = e.response?.data?.message || 'Gagal memuat riwayat cabang.';
        logger.error('Failed to fetch branch history:', e);
        toast.error(this.error);
        this.pengajuanList = [];
      } finally {
        this.loading = false;
      }
    },
  },
});