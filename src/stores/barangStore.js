import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { toast } from 'vue3-toastify';

export const useBarangStore = defineStore('barang', {
  state: () => ({
    itemList: [],
        pagination: {
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
      total: 0,
    },
    loading: false,
  }),
  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const { data } = await apiClient.get('/barang', { params: { with: 'jenis_barang' } });
        this.itemList = data.data || [];
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        toast.error('Gagal memuat daftar barang.');
      } finally {
        this.loading = false;
      }
    },
    async saveItem(itemData) {
        // ... save logic (create/update)
        await this.fetchItems(); // Refresh list
        return true;
    },
    async deleteItem(id) {
        // ... delete logic
        this.itemList = this.itemList.filter(i => i.id_barang !== id);
    },
  },
});