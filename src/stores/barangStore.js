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
    async fetchItems(page = 1, search = '') {
      this.loading = true;
      try {
        const params = { page };
        if (search) params.search = search;
        const { data } = await apiClient.get('/barang', { params });
        this.itemList = data.data || [];
        this.pagination = data.meta || { current_page: 1, last_page: 1, total: 0 };
      } catch (e) {
        toast.error('Gagal memuat daftar barang.');
      } finally {
        this.loading = false;
      }
    },
    async saveItem(itemData) {
      this.loading = true;
      try {
        // Prefer explicit mode from caller if provided; otherwise infer from current list
        const explicitMode = typeof itemData._isEdit === 'boolean' ? itemData._isEdit : null;
        const existsInList = this.itemList?.some(i => i.id_barang === itemData.id_barang);
        const isEditing = explicitMode ?? !!existsInList;

        // Build payload; include id_barang for POST as backend requires it
        const basePayload = {
          id_jenis_barang: itemData.id_jenis_barang,
          nama_barang: itemData.nama_barang,
          harga_barang: itemData.harga_barang,
          deskripsi: itemData.deskripsi,
          satuan: itemData.satuan,
          batas_minimum: itemData.batas_minimum,
        };

        if (isEditing) {
          try {
            await apiClient.put(`/barang/${itemData.id_barang}`, basePayload);
            toast.success('Barang berhasil diupdate.');
          } catch (err) {
            // If the resource doesn't exist, fallback to create
            if (err?.response?.status === 404) {
              await apiClient.post('/barang', { id_barang: itemData.id_barang, ...basePayload });
              toast.success('Barang baru dibuat (fallback).');
            } else {
              throw err;
            }
          }
        } else {
          await apiClient.post('/barang', { id_barang: itemData.id_barang, ...basePayload });
          toast.success('Barang berhasil ditambahkan.');
        }

        await this.fetchItems(this.pagination.current_page);
        return true;
      } catch (e) {
        const msg = e.response?.data?.message || 'Gagal menyimpan barang.';
        toast.error(msg);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async deleteItem(id) {
      this.loading = true;
      try {
        await apiClient.delete(`/barang/${id}`);
        toast.success('Barang berhasil dihapus.');
        this.itemList = this.itemList.filter(i => i.id_barang !== id);
      } catch (e) {
        const msg = e.response?.data?.message || 'Gagal menghapus barang.';
        toast.error(msg);
      } finally {
        this.loading = false;
      }
    },
  },
});