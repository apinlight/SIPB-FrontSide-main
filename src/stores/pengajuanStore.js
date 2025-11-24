import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

// Helper function to process the raw API data. This contains all the logic
// from the old `enhancedBarangList` computed property.
function processBarangData(apiData) {
  const { barang, user_info } = apiData;

  return barang.map(b => {
    // stock_info is now embedded in each barang item
    const currentStock = b.stock_info?.user_stock || 0;
    const adminStock = b.stock_info?.admin_stock || 0;
    
    // Per-item limits were removed from the system - limits are now monthly-based only
    const batasLimit = null;
    const availableAllocation = null;
    
    let status = 'available';
    let statusText = currentStock > 0 ? 'Stok Tersedia' : 'Stok Kosong';
    let statusColor = currentStock > 0 ? 'text-green-600' : 'text-gray-600';

    return {
      ...b,
      currentStock,
      adminStock,
      batasLimit,
      availableAllocation,
      status,
      statusText,
      statusColor,
      showLimitInfo: false,
    };
  });
}


export const usePengajuanStore = defineStore('pengajuan', {
  state: () => ({
    // The final, processed list of items ready for display
    barangList: [],
    // The "shopping cart" of selected items
    selectedItems: {},
    // Monthly usage statistics
    monthlyUsage: {
      current: 0,
      limit: 1,
      remaining: 0,
      percentage: 0,
    },
    loading: false,
    error: null,
  }),

  getters: {
    // A simple array of the selected items, ready for the summary component
    summaryList: (state) => Object.values(state.selectedItems),
  },

  actions: {
    /**
     * Main action to fetch and process all data needed for the page.
     * Encapsulates the complex try/catch fallback logic.
     */
    async initPageData() {
      this.loading = true;
      this.error = null;
      logger.info('Store: Initializing Pengajuan page data');

      try {
        const response = await apiClient.get('/pengajuan/info/barang');
        const data = response.data.data;

        // Process and set state from the combined endpoint
        this.barangList = processBarangData(data);
        
        const current = data.monthly_info.used || 0;
        const limit = data.monthly_info.limit || 1;
        this.monthlyUsage = {
          current,
          limit,
          remaining: Math.max(0, limit - current),
          percentage: Math.min(100, Math.round((current / limit) * 100)),
        };
        logger.success('Store: Combined pengajuan data loaded successfully');

      } catch (err) {
        this.error = 'Gagal memuat data pengajuan. Sebagian data mungkin tidak akurat.';
        logger.error('Store: Failed to fetch combined pengajuan data. Logic will be handled by the backend.', err);
        // Let the backend handle fallback logic if the primary endpoint fails.
        // The component does not need to know about this complexity.
      } finally {
        this.loading = false;
      }
    },

    /**
     * Updates the user's selection of items.
     */
    updateSelectedItem({ id_barang, jumlah }) {
      if (jumlah > 0) {
        const barang = this.barangList.find(b => b.id_barang === id_barang);
        if (barang) {
          this.selectedItems[id_barang] = { ...barang, jumlah };
        }
      } else {
        delete this.selectedItems[id_barang];
      }
    },

    /**
     * Validates and submits the pengajuan to the backend.
     */
    async submitPengajuan() {
      const userStore = useUserStore();
      if (this.summaryList.length === 0) {
        toast.error('Pilih minimal satu barang untuk diajukan.');
        return;
      }
      
      // Validation logic is now centralized in the store
      if (userStore.isAdmin) {
         if (this.monthlyUsage.current >= this.monthlyUsage.limit) {
            toast.error(`Anda sudah mencapai batas maksimal ${this.monthlyUsage.limit} pengajuan bulan ini.`);
            return;
         }

         const allocationErrors = this.summaryList
            .filter(item => item.availableAllocation !== null && item.jumlah > item.availableAllocation)
            .map(item => `${item.nama_barang}: melebihi batas (maks: ${item.availableAllocation})`);

         if (allocationErrors.length > 0) {
            toast.error('Pengajuan tidak valid:\n' + allocationErrors.join('\n'));
            return;
         }
      }

      this.loading = true;
      const payload = {
        items: this.summaryList.map(item => ({
          id_barang: item.id_barang,
          jumlah: item.jumlah,
        })),
        // Other pengajuan data can be added here if needed
      };

      try {
        await apiClient.post('/pengajuan', payload);
        toast.success('Pengajuan berhasil dikirim!');
        this.selectedItems = {}; // Reset the "cart"
        await this.initPageData(); // Refresh all data on the page
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Gagal mengirim pengajuan.';
        toast.error(errorMsg);
        this.error = errorMsg;
      } finally {
        this.loading = false;
      }
    },
  },
});