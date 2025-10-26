import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useJenisBarangStore = defineStore('jenisBarang', {
  state: () => ({
    itemList: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchItems(page = 1) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apiClient.get('/jenis-barang', { params: { page } });
        this.itemList = data.data;
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        this.error = 'Gagal memuat data jenis barang.';
        toast.error(this.error);
        logger.error('Error fetching jenis barang:', e);
      } finally {
        this.loading = false;
      }
    },

    async saveItem(itemData) {
      this.loading = true;
      try {
        const isEditing = !!itemData.id_jenis_barang;
    const payload = {
      nama_jenis_barang: itemData.nama_jenis_barang,
    };

        if (isEditing) {
          await apiClient.put(`/jenis-barang/${itemData.id_jenis_barang}`, payload);
          toast.success('Jenis barang berhasil diupdate.');
        } else {
          await apiClient.post('/jenis-barang', payload);
          toast.success('Jenis barang berhasil ditambahkan.');
        }
        await this.fetchItems(); // Refresh the list
        return true; // Indicate success
      } catch (e) {
        const errorMsg = e.response?.data?.message || 'Gagal menyimpan jenis barang.';
        toast.error(errorMsg);
        logger.error('Error saving jenis barang:', e);
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },

    async deleteItem(id) {
      this.loading = true;
      try {
        await apiClient.delete(`/jenis-barang/${id}`);
        toast.success('Jenis barang berhasil dihapus.');
        // You can either re-fetch or optimistically remove from the list
        this.itemList = this.itemList.filter(item => item.id_jenis_barang !== id);
      } catch (e) {
        const errorMsg = e.response?.data?.message || 'Gagal menghapus jenis barang.';
        toast.error(errorMsg);
        logger.error('Error deleting jenis barang:', e);
      } finally {
        this.loading = false;
      }
    },
  },
});