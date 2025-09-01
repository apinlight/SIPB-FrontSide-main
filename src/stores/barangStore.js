import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { toast } from 'vue3-toastify';

export const useBarangStore = defineStore('barang', {
  state: () => ({
    itemList: [],
    loading: false,
  }),
  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const { data } = await apiClient.get('/barang', { params: { with: 'jenis_barang' } });
        this.itemList = data.data;
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