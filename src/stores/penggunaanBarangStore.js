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
    loading: false,
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
      this.loading = true
      this.error = null
      
      try {
        logger.debug('Fetching penggunaan barang data...')
        const response = await API.get('/penggunaan-barang', { params })
        // Backend returns Laravel Resource collection with { data, meta }
        this.penggunaanList = response.data?.data || []
        if (response.data?.meta) {
          this.pagination = response.data.meta
        }
        logger.success('Penggunaan barang data loaded successfully')
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch penggunaan barang'
        logger.error('Failed to fetch penggunaan barang:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createPenggunaan(data) {
      this.loading = true
      this.error = null
      
      try {
        logger.debug('Creating penggunaan barang:', data)
        const response = await API.post('/penggunaan-barang', data)
        // Backend returns a Resource on success (201)
        const created = response.data?.data
        if (created) {
          this.penggunaanList.unshift(created)
        }
        logger.success('Penggunaan barang created successfully')
        return created
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to create penggunaan barang'
        logger.error('Failed to create penggunaan barang:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async savePenggunaan(data) {
      // ✅ NEW: Unified create/update method
      this.loading = true
      this.error = null
      
      try {
        const isUpdate = !!data.id_penggunaan
        const endpoint = isUpdate 
          ? `/penggunaan-barang/${data.id_penggunaan}` 
          : '/penggunaan-barang'
        const method = isUpdate ? 'put' : 'post'
        
        logger.debug(`${isUpdate ? 'Updating' : 'Creating'} penggunaan barang:`, data)
        const response = await API[method](endpoint, data)
        
        const saved = response.data?.data || response.data
        
        if (isUpdate) {
          const index = this.penggunaanList.findIndex(p => p.id_penggunaan === saved.id_penggunaan)
          if (index !== -1) {
            this.penggunaanList[index] = saved
          }
        } else {
          this.penggunaanList.unshift(saved)
        }
        
        logger.success(`Penggunaan barang ${isUpdate ? 'updated' : 'created'} successfully`)
        return saved
      } catch (err) {
        this.error = err.response?.data?.message || `Failed to ${data.id_penggunaan ? 'update' : 'create'} penggunaan barang`
        logger.error('Failed to save penggunaan barang:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableStock(idBarang = null) {
      this.loading = true
      this.error = null
      
      try {
        // ✅ FIX: Endpoint path corrected to match backend routes
        const endpoint = idBarang ? `/stok/tersedia/${idBarang}` : '/stok/tersedia'
        const response = await API.get(endpoint)
        
        // Backend returns plain JSON array for stock
        this.availableStock = response.data || []
        logger.success('Available stock loaded successfully')
        return this.availableStock
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch available stock'
        logger.error('Failed to fetch available stock:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
