import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import { logger } from '@/lib/logger';
import { toast } from 'vue3-toastify';

export const useLaporanStore = defineStore('laporan', {
  state: () => ({
    filters: {
      period: 'month',
      branch: '',
      startDate: '',
      endDate: '',
    },
    summary: {
      total_pengajuan: 0,
      total_disetujui: 0,
      total_menunggu: 0,
      total_nilai: 0,
    },
    laporanBarang: [],
    laporanPengajuan: [],
    laporanCabang: [],
    branches: [],
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Fetches and processes all data required for the reports based on current filters.
     */
    async fetchLaporanData() {
      this.loading = true;
      this.error = null;
      logger.info('Store: Fetching laporan data', { filters: this.filters });

      try {
        const params = {
          period: this.filters.period,
          branch: this.filters.branch || undefined,
          start_date: this.filters.startDate || undefined,
          end_date: this.filters.endDate || undefined,
        };

        // Fetch the raw data
        const [pengajuanRes, barangRes] = await Promise.all([
            apiClient.get('/pengajuan', { params }),
            apiClient.get('/barang', { params }) // Assuming barang can also be filtered
        ]);

        const allPengajuan = pengajuanRes.data.data || [];
        
        // Process data - This logic is now centralized here
        this._processData(allPengajuan, barangRes.data.data || []);
        
        logger.success('Store: Laporan data processed successfully');
      } catch (err) {
        this.error = 'Gagal memuat data laporan.';
        logger.error('Store: Failed to fetch laporan data', err);
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * A private helper to perform all the client-side data aggregation.
     */
    _processData(allPengajuan, allBarang) {
        // 1. Build Summary
        this.summary = {
            total_pengajuan: allPengajuan.length,
            total_disetujui: allPengajuan.filter(p => p.status_pengajuan === 'Disetujui').length,
            total_menunggu: allPengajuan.filter(p => p.status_pengajuan === 'Menunggu Persetujuan').length,
            total_nilai: allPengajuan.reduce((sum, p) => sum + (p.total_nilai || 0), 0),
        };

        // 2. Set Laporan Pengajuan
        this.laporanPengajuan = allPengajuan;

        // 3. Set Laporan Barang
        this.laporanBarang = allBarang;

        // 4. Build Branch Summary (Grouping logic)
        const branchSummary = {};
        allPengajuan.forEach(p => {
            const branch = p.user?.branch_name || 'Unknown';
            if (!branchSummary[branch]) {
                branchSummary[branch] = {
                    branch_name: branch, total_pengajuan: 0, total_disetujui: 0, total_menunggu: 0, total_ditolak: 0, total_nilai: 0
                };
            }
            branchSummary[branch].total_pengajuan++;
            if (p.status_pengajuan === 'Disetujui') branchSummary[branch].total_disetujui++;
            if (p.status_pengajuan === 'Menunggu Persetujuan') branchSummary[branch].total_menunggu++;
            if (p.status_pengajuan === 'Ditolak') branchSummary[branch].total_ditolak++;
            branchSummary[branch].total_nilai += (p.total_nilai || 0);
        });
        this.laporanCabang = Object.values(branchSummary);

        // 5. Extract unique branches for the filter dropdown
        this.branches = [...new Set(allPengajuan.map(p => p.user?.branch_name).filter(Boolean))];
    },

    /**
     * Handles exporting the report data.
     */
    async exportLaporan() {
      logger.info('Store: Exporting laporan data', { filters: this.filters });
      try {
        const params = {
          period: this.filters.period,
          branch: this.filters.branch || undefined,
          start_date: this.filters.startDate || undefined,
          end_date: this.filters.endDate || undefined,
          type: 'summary', // As seen in original component
        };

        const response = await apiClient.get('/laporan/export', { params, responseType: 'blob' });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `laporan-pengadaan-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Laporan berhasil diexport.');
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Gagal mengekspor laporan.';
        logger.error('Store: Failed to export laporan', err);
        toast.error(errorMsg);
      }
    }
  },
});