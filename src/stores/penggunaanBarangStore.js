// src/stores/penggunaanBarangStore.js
import { defineStore } from 'pinia'
import { logger } from '@/lib/logger'
import API from '@/lib/api' // ✅ Add missing import
import { useUserStore } from '@/stores/userStore' // ✅ Add missing import

export const usePenggunaanBarangStore = defineStore('penggunaanBarang', {
  state: () => ({
    penggunaanList: [],
    currentPenggunaan: null,
    availableStock: [],
    isLoading: false,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
      total: 0
    }
  }),

  getters: {
    myPenggunaan: (state) => {
      const userStore = useUserStore()
      return state.penggunaanList.filter(item => 
        item.unique_id === userStore.user?.unique_id
      )
    },
    
    pendingPenggunaan: (state) => {
      return state.penggunaanList.filter(item => item.status === 'pending')
    },
    
    approvedPenggunaan: (state) => {
      return state.penggunaanList.filter(item => item.status === 'approved')
    }
  },

  actions: {
    async fetchPenggunaanBarang(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        logger.debug('Fetching penggunaan barang data...')
        const response = await API.get('/penggunaan-barang', { params })
        
        if (response.data.success) {
          this.penggunaanList = response.data.data
          if (response.data.meta) {
            this.pagination = response.data.meta
          }
          logger.success('Penggunaan barang data loaded successfully')
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch penggunaan barang'
        logger.error('Failed to fetch penggunaan barang:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async createPenggunaan(data) {
      this.isLoading = true
      this.error = null
      
      try {
        logger.debug('Creating penggunaan barang:', data)
        const response = await API.post('/penggunaan-barang', data)
        
        if (response.data.success) {
          this.penggunaanList.unshift(response.data.data)
          logger.success('Penggunaan barang created successfully')
          return response.data.data
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to create penggunaan barang'
        logger.error('Failed to create penggunaan barang:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchAvailableStock(idBarang = null) {
      this.isLoading = true
      this.error = null
      
      try {
        const params = idBarang ? { id_barang: idBarang } : {}
        const response = await API.get('/stok-tersedia', { params })
        
        if (response.data.success) {
          this.availableStock = response.data.data
          logger.success('Available stock loaded successfully')
          return response.data.data
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch available stock'
        logger.error('Failed to fetch available stock:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
