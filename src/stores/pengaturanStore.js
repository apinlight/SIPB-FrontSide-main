import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { toast } from 'vue3-toastify';

export const usePengaturanStore = defineStore('pengaturan', {
  state: () => ({
    batasBarangList: [],
    barangList: [], // For the form dropdown
    gudangData: [],
    monthlyLimit: 0,
    pengajuanStats: {},
    loading: false,
  }),

  getters: {
    // Getter to calculate stock status based on the fetched data
    getBatasWithStatus: (state) => {
      const stockCache = {};
      state.gudangData.forEach(item => {
        if (!stockCache[item.id_barang]) stockCache[item.id_barang] = 0;
        stockCache[item.id_barang] += (item.jumlah_barang || 0);
      });

      return state.batasBarangList.map(item => {
        const currentStock = stockCache[item.id_barang] || 0;
        const batas = item.batas_barang;
        let status = 'Normal';
        if (currentStock <= batas) status = 'Peringatan';
        if (currentStock <= batas * 0.5) status = 'Kritis';
        if (currentStock === 0) status = 'Habis';
        return { ...item, currentStock, status };
      });
    },
  },

  actions: {
    async fetchBatasBarang() {
      this.loading = true;
      try {
        const [batasRes, barangRes, gudangRes] = await Promise.all([
          apiClient.get('/batas-barang', { params: { with: 'barang.jenis_barang' } }),
          apiClient.get('/barang'),
          apiClient.get('/gudang'),
        ]);
        this.batasBarangList = batasRes.data.data;
        this.barangList = barangRes.data.data;
        this.gudangData = gudangRes.data.data;
      } catch (e) {
        toast.error('Gagal memuat data batas barang.');
      } finally {
        this.loading = false;
      }
    },

    async saveBatasBarang(formData) {
        try {
            if (formData.id_barang) { // Assuming edit uses id_barang
                await apiClient.put(`/batas-barang/${formData.id_barang}`, formData);
                toast.success('Batas barang berhasil diupdate.');
            } else {
                await apiClient.post('/batas-barang', formData);
                toast.success('Batas barang berhasil ditambahkan.');
            }
            await this.fetchBatasBarang();
            return true;
        } catch(e) {
            toast.error(e.response?.data?.message || 'Gagal menyimpan batas barang.');
            return false;
        }
    },

    async deleteBatasBarang(id) {
        try {
            await apiClient.delete(`/batas-barang/${id}`);
            toast.success('Batas barang berhasil dihapus.');
            this.batasBarangList = this.batasBarangList.filter(b => b.id_barang !== id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal menghapus batas barang.');
        }
    },

    async fetchBatasPengajuan() {
        this.loading = true;
        try {
            const [limitRes, statsRes] = await Promise.all([
                apiClient.get('/global-settings/monthly-limit'),
                apiClient.get('/laporan/summary') // Assuming an endpoint for stats exists
            ]);
            this.monthlyLimit = limitRes.data.monthly_limit || 0;
            this.pengajuanStats = statsRes.data.data;
        } catch(e) {
            toast.error('Gagal memuat data batas pengajuan.');
        } finally {
            this.loading = false;
        }
    },

    async saveBatasPengajuan(newLimit) {
        try {
            await apiClient.put('/global-settings/monthly-limit', { monthly_limit: newLimit });
            this.monthlyLimit = newLimit;
            toast.success('Batas pengajuan berhasil diupdate.');
            return true;
        } catch(e) {
            toast.error(e.response?.data?.message || 'Gagal menyimpan batas pengajuan.');
            return false;
        }
    }
  },
});