import { defineStore } from 'pinia';
import apiClient from '@/lib/api';

export const useCabangStore = defineStore('cabang', {
  state: () => ({
    cabangList: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCabang() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/cabang');
        this.cabangList = response.data.data || [];
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data cabang';
        console.error('Error fetching cabang:', error);
      } finally {
        this.loading = false;
      }
    },

    async createCabang(data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/cabang', data);
        this.cabangList.push(response.data.data);
        return { success: true, data: response.data.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menambah cabang';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateCabang(id, data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/cabang/${id}`, data);
        const index = this.cabangList.findIndex((c) => c.id_cabang === id);
        if (index !== -1) {
          this.cabangList[index] = response.data.data;
        }
        return { success: true, data: response.data.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengupdate cabang';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async deleteCabang(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/cabang/${id}`);
        this.cabangList = this.cabangList.filter((c) => c.id_cabang !== id);
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menghapus cabang';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
  },
});
