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
        // Build params: convert period -> start_date/end_date if needed
        const toISODate = (d) => new Date(d).toISOString().slice(0, 10);
        let start = this.filters.startDate || undefined;
        let end = this.filters.endDate || undefined;
        if (!start && !end) {
          const now = new Date();
          if (this.filters.period === 'today') {
            start = end = toISODate(now);
          } else if (this.filters.period === 'week') {
            const first = new Date(now);
            first.setDate(now.getDate() - now.getDay()); // start of week (Sunday)
            start = toISODate(first);
            end = toISODate(now);
          } else if (this.filters.period === 'month') {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            start = toISODate(first);
            end = toISODate(last);
          } else if (this.filters.period === 'year') {
            const first = new Date(now.getFullYear(), 0, 1);
            const last = new Date(now.getFullYear(), 11, 31);
            start = toISODate(first);
            end = toISODate(last);
          } else if (this.filters.period === 'all') {
            start = undefined;
            end = undefined;
          }
        }

        const params = {
          branch: this.filters.branch || undefined,
          start_date: start,
          end_date: end,
        };

        // Fetch reports from dedicated laporan endpoints
        const [summaryRes, barangRes, pengajuanRes, cabangRes] = await Promise.all([
          apiClient.get('/laporan/summary', { params }),
          apiClient.get('/laporan/barang', { params }),
          apiClient.get('/laporan/pengajuan', { params }),
          // cabang endpoint may be restricted; handle error later
          apiClient.get('/laporan/cabang', { params }).catch(err => ({ error: err })),
        ]);

        // Assign state robustly: backend wraps payload as { status, data }
        this.summary = summaryRes?.data?.data || { total_pengajuan: 0, total_disetujui: 0, total_menunggu: 0, total_nilai: 0 };
        this.laporanBarang = barangRes?.data?.data || [];
        const allPengajuan = pengajuanRes?.data?.data || [];
        this.laporanPengajuan = allPengajuan;

        // Cabang (optional)
        if (!cabangRes?.error) {
          this.laporanCabang = cabangRes?.data?.data || [];
          this.branches = [...new Set((this.laporanCabang || []).map(c => c.branch_name).filter(Boolean))];
        } else {
          // Fallback: derive branches from pengajuan data
          this.branches = [...new Set(allPengajuan.map(p => p.user?.branch_name).filter(Boolean))];
        }

        logger.success('Store: Laporan data fetched successfully');
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
  _processData() {
    // Deprecated: server-side aggregation is used now via /laporan endpoints.
  },

    /**
     * Handles exporting the report data.
     */
  async exportLaporan(typeOrEvent = 'summary', format = 'xlsx') {
      // Guard against Vue passing PointerEvent when no arg provided
      const allowedTypes = ['summary', 'barang', 'pengajuan', 'penggunaan', 'stok', 'all'];
      if (typeOrEvent && typeof typeOrEvent === 'object' && typeof typeOrEvent.preventDefault === 'function') {
        try { typeOrEvent.preventDefault(); } catch (_) {}
      }
      const type = typeof typeOrEvent === 'string' && allowedTypes.includes(typeOrEvent)
        ? typeOrEvent
        : 'summary';

      logger.info('Store: Exporting laporan data', { type, filters: this.filters });
      try {
        const params = {
          period: this.filters.period,
          branch: this.filters.branch || undefined,
          start_date: this.filters.startDate || undefined,
          end_date: this.filters.endDate || undefined,
        };

        const base = format === 'docx' ? '/laporan/export-word' : '/laporan/export';
        const response = await apiClient.get(`${base}/${type}`, { params, responseType: 'blob' });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // Try use filename from header if provided
        const cd = response.headers?.['content-disposition'] || response.headers?.get?.('content-disposition');
        let filename = `laporan-${type}-${new Date().toISOString().split('T')[0]}.${format === 'docx' ? 'docx' : 'xlsx'}`;
        if (cd && /filename=/i.test(cd)) {
          const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
          const raw = decodeURIComponent(match?.[1] || match?.[2] || '');
          if (raw) filename = raw;
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Laporan berhasil diexport.');
      } catch (err) {
        let errorMsg = err.response?.data?.message || 'Gagal mengekspor laporan.';
        if (err.response?.status === 403) {
          errorMsg = 'Anda tidak memiliki izin untuk mengekspor laporan ini.';
        } else if (err.response?.status === 501 && format === 'docx') {
          errorMsg = 'Export Word belum diaktifkan di server. Mohon install PHPWord atau pilih format Excel.';
        }
        logger.error('Store: Failed to export laporan', err);
        toast.error(errorMsg);
      }
    }
  },
});