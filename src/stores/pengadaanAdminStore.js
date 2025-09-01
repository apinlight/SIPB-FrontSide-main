import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const usePengadaanAdminStore = defineStore('pengadaanAdmin', {
  state: () => ({
    // State for all three pages
    itemList: [], // Generic name for the list
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { search: '', branch: '', user: '' },
    loading: false,
    processing: false, // For long actions like 'Tambah ke Gudang'

    // State specifically for the Manual Pengadaan form
    formDependencies: {
      users: [],
      barang: [],
    },
  }),

  actions: {
    /**
     * A flexible action to fetch data for any of the admin pages.
     * @param {object} { status, endpoint, page }
     */
    async fetchItems({ status, endpoint = '/pengajuan', page = 1 }) {
      this.loading = true;
      try {
        const params = {
          page,
          status,
          search: this.filters.search || undefined,
          branch: this.filters.branch || undefined,
          user_id: this.filters.user || undefined,
        };
        const { data } = await apiClient.get(endpoint, { params });
        this.itemList = data.data || [];
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        toast.error(e.response?.data?.message || `Failed to load data from ${endpoint}`);
        this.itemList = [];
      } finally {
        this.loading = false;
      }
    },

    async approvePengajuan(id) {
      this.processing = true;
      try {
        await apiClient.put(`/pengajuan/${id}`, { status_pengajuan: 'Disetujui' });
        toast.success(`Pengajuan #${id} disetujui.`);
        // Refresh the list by removing the approved item
        this.itemList = this.itemList.filter(item => item.id_pengajuan !== id);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Gagal menyetujui pengajuan.');
      } finally {
        this.processing = false;
      }
    },

    async rejectPengajuan({ id, reason }) {
      this.processing = true;
      try {
        await apiClient.put(`/pengajuan/${id}`, { status_pengajuan: 'Ditolak', rejection_reason: reason });
        toast.success(`Pengajuan #${id} ditolak.`);
        // Refresh the list by removing the rejected item
        this.itemList = this.itemList.filter(item => item.id_pengajuan !== id);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Gagal menolak pengajuan.');
      } finally {
        this.processing = false;
      }
    },

    async processToGudang(pengajuan) {
      this.processing = true;
      try {
        // The backend should ideally handle this in a single transaction.
        // This action encapsulates the multi-step process required by the current API.
        await apiClient.post(`/pengajuan/${pengajuan.id_pengajuan}/process-to-gudang`);
        toast.success(`Pengajuan #${pengajuan.id_pengajuan} berhasil diproses ke gudang.`);
        this.itemList = this.itemList.filter(item => item.id_pengajuan !== pengajuan.id_pengajuan);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Gagal memproses ke gudang.');
      } finally {
        this.processing = false;
      }
    },

    async fetchFormDependencies() {
      this.loading = true;
      try {
        const [usersRes, barangRes] = await Promise.all([apiClient.get('/users'), apiClient.get('/barang')]);
        this.formDependencies.users = usersRes.data.data;
        this.formDependencies.barang = barangRes.data.data;
      } catch (e) {
        toast.error('Gagal memuat data untuk form.');
      } finally {
        this.loading = false;
      }
    },

    async createManualPengadaan(formData) {
        this.processing = true;
        try {
            await apiClient.post('/pengajuan/manual', formData);
            toast.success('Pengadaan manual berhasil ditambahkan.');
            // Refresh the history list
            await this.fetchItems({ endpoint: '/gudang', status: 'manual' }); // Assuming 'manual' is a valid status/type filter
            return true; // Indicate success
        } catch(e) {
            toast.error(e.response?.data?.message || 'Gagal membuat pengadaan manual.');
            return false; // Indicate failure
        } finally {
            this.processing = false;
        }
    },
    
    async deleteManualRiwayat(item) {
        try {
            await apiClient.delete(`/gudang/${item.unique_id}/${item.id_barang}`);
            toast.success('Riwayat berhasil dihapus.');
            this.itemList = this.itemList.filter(i => i.id !== item.id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal menghapus riwayat.');
        }
    }
  },
});