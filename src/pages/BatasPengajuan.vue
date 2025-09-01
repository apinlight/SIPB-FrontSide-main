<!-- src/pages/BatasPengajuan.vue -->
<template>
    <DefaultLayout>
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">📋 Batas Pengajuan Bulanan</h1>
                <button @click="showForm = !showForm"
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    {{ showForm ? 'Tutup Form' : '+ Set Batas Pengajuan' }}
                </button>
            </div>

            <!-- Alert -->
            <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
                {{ alert.message }}
            </div>

            <!-- Current Setting Display -->
            <div class="bg-white p-6 rounded-lg shadow mb-6">
                <div class="text-center">
                    <h2 class="text-lg font-semibold text-gray-700 mb-2">Batas Pengajuan Bulanan Saat Ini</h2>
                    <div class="text-4xl font-bold text-blue-600 mb-4">
                        {{ currentLimit || 'Belum Diatur' }}
                        <span v-if="currentLimit" class="text-lg text-gray-500">pengajuan/bulan</span>
                    </div>
                    <p class="text-gray-600">
                        Setiap user dapat membuat maksimal {{ currentLimit || 0 }} pengajuan per bulan
                    </p>
                </div>
            </div>

            <!-- Form -->
            <div v-if="showForm" class="bg-white p-4 rounded-lg shadow mb-6">
                <h2 class="text-lg font-semibold mb-4">Edit Batas Pengajuan Bulanan</h2>
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <p class="text-blue-800 text-sm">
                        <strong>Info:</strong> Batas ini berlaku untuk semua user. Setiap user dapat membuat maksimal 
                        pengajuan per bulan sesuai nilai yang ditetapkan.
                    </p>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="max-w-md">
                        <div>
                            <label class="block text-sm font-medium mb-2">Batas Maksimal Pengajuan per Bulan</label>
                            <input v-model.number="form.monthly_limit" type="number" min="1"
                                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Masukkan batas maksimal" required />
                            <p class="text-xs text-gray-500 mt-1">
                                Jumlah maksimal pengajuan yang dapat dibuat per user per bulan
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-2 mt-6">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            :disabled="loading">
                            {{ loading ? 'Menyimpan...' : 'Update Batas' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            Batal
                        </button>
                    </div>
                </form>
            </div>

            <!-- Monthly Usage Statistics -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="p-6">
                    <h3 class="text-lg font-semibold mb-4">Statistik Penggunaan Bulan Ini</h3>
                    <div v-if="loading" class="p-8 text-center text-gray-500">
                        Memuat data...
                    </div>
                    <div v-else class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-500">Total Pengajuan Bulan Ini</h4>
                                <p class="text-2xl font-bold text-blue-600">{{ totalThisMonth }}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-500">User Aktif</h4>
                                <p class="text-2xl font-bold text-green-600">{{ activeUsers }}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-500">Rata-rata per User</h4>
                                <p class="text-2xl font-bold text-purple-600">{{ averagePerUser }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { logger } from '@/lib/logger'

// State
const showForm = ref(false)
const loading = ref(false)
const currentLimit = ref(0)
const pengajuanData = ref([])
const alert = ref({ message: '', type: 'success' })

const form = ref({
    monthly_limit: 0
})

// Computed
const alertClass = computed(() =>
    alert.value.type === 'success'
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200'
)

const totalThisMonth = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return pengajuanData.value.filter(pengajuan => {
        const pengajuanDate = new Date(pengajuan.created_at)
        return pengajuanDate.getMonth() === currentMonth && 
               pengajuanDate.getFullYear() === currentYear
    }).length
})

const activeUsers = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const uniqueUsers = new Set()
    
    pengajuanData.value.forEach(pengajuan => {
        const pengajuanDate = new Date(pengajuan.created_at)
        if (pengajuanDate.getMonth() === currentMonth && 
            pengajuanDate.getFullYear() === currentYear) {
            uniqueUsers.add(pengajuan.unique_id)
        }
    })
    
    return uniqueUsers.size
})

const averagePerUser = computed(() => {
    return activeUsers.value > 0 
        ? Math.round((totalThisMonth.value / activeUsers.value) * 10) / 10
        : 0
})

// Methods
const fetchCurrentLimit = async () => {
    logger.debug('Fetching current monthly pengajuan limit')
    try {
        const response = await API.get('/global-settings/monthly-limit')
        currentLimit.value = response.data.monthly_limit || 0
        form.value.monthly_limit = currentLimit.value
        logger.success('Current monthly limit loaded', { limit: currentLimit.value })
    } catch (error) {
        logger.error('Error fetching monthly limit:', error.message)
        showAlert('Gagal memuat batas pengajuan saat ini', 'error')
    }
}

const fetchPengajuanData = async () => {
    logger.debug('Fetching pengajuan data for usage calculation')
    try {
        const response = await API.get('/pengajuan')
        pengajuanData.value = response.data.data
        logger.success('Pengajuan data loaded', { count: pengajuanData.value.length })
    } catch (error) {
        logger.error('Error fetching pengajuan data:', error.message)
    }
}

const submitForm = async () => {
    loading.value = true
    logger.info('Updating monthly pengajuan limit', { 
        new_limit: form.value.monthly_limit
    })
    
    try {
        await API.put('/global-settings/monthly-limit', {
            monthly_limit: form.value.monthly_limit
        })
        
        currentLimit.value = form.value.monthly_limit
        logger.success('Monthly pengajuan limit updated successfully', { new_limit: form.value.monthly_limit })
        showAlert('Batas pengajuan bulanan berhasil diupdate', 'success')
        
        resetForm()
    } catch (error) {
        logger.error('Error updating monthly pengajuan limit:', error.message, { form: form.value })
        const errorMsg = error.response?.data?.message || 'Gagal menyimpan batas pengajuan'
        showAlert(errorMsg, 'error')
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    logger.debug('Resetting batas pengajuan form')
    form.value = {
        monthly_limit: currentLimit.value
    }
    showForm.value = false
}



const showAlert = (message, type = 'success') => {
    alert.value = { message, type }
    setTimeout(() => {
        alert.value.message = ''
    }, 3000)
}

// Lifecycle
onMounted(async () => {
    logger.info('BatasPengajuan page mounted')
    loading.value = true
    try {
        await Promise.all([
            fetchCurrentLimit(),
            fetchPengajuanData()
        ])
    } finally {
        loading.value = false
    }
})
</script>