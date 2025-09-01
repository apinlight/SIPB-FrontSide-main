import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useStokStore = defineStore('stok', {
  state: () => ({
    stockList: [],
    isLoading: false,
    error: null,
    filterQuery: '',
  }),

  getters: {
    // Filtering logic now lives in the store
    filteredStock: (state) => {
      if (!state.filterQuery) {
        return state.stockList;
      }
      const query = state.filterQuery.toLowerCase();
      return state.stockList.filter(item =>
        item.nama_barang.toLowerCase().includes(query) ||
        item.id_barang.toLowerCase().includes(query)
      );
    },

    // Summary calculations are now getters, reusable by any component
    totalStockCount: (state) => {
      return state.stockList.reduce((total, item) => total + item.jumlah_tersedia, 0);
    },
    lowStockCount: (state) => {
      return state.stockList.filter(item => item.jumlah_tersedia <= 5).length;
    },
    totalItemTypes: (state) => {
      return state.stockList.length;
    }
  },

  actions: {
    // This logic is moved from the old store to its correct home
    async fetchStock() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/stok-tersedia');
        this.stockList = response.data.data;
        logger.success('Available stock loaded successfully');
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch available stock';
        logger.error('Failed to fetch available stock:', err);
        toast.error(this.error);
      } finally {
        this.isLoading = false;
      }
    },

    // Action to update the filter from a component
    setFilter(query) {
        this.filterQuery = query;
    }
  },
});