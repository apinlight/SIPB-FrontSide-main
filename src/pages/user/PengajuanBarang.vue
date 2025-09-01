<!-- src/pages/user/PengajuanBarang.vue -->
<template>
    <DefaultLayout>
        <div class="p-6 space-y-6">
            <h1 class="text-2xl font-bold">Pengajuan Pengadaan Barang</h1>

            <!-- Alert -->
            <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
                {{ alert.message }}
            </div>

            <!-- Monthly Limit Status - Show simplified version for regular users -->
            <div class="bg-white rounded-lg shadow p-4">
                <h3 class="text-lg font-semibold mb-3">Status Pengajuan Bulanan Anda</h3>
                <div v-if="userStore.isAdmin" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-blue-700">Pengajuan Bulan Ini</h4>
                        <p class="text-2xl font-bold text-blue-600">{{ monthlyUsage.current }}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-green-700">Batas Maksimal</h4>
                        <p class="text-2xl font-bold text-green-600">{{ monthlyUsage.limit }}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-purple-700">Sisa Pengajuan</h4>
                        <p class="text-2xl font-bold text-purple-600">{{ monthlyUsage.remaining }}</p>
                    </div>
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-blue-700">Pengajuan Bulan Ini</h4>
                        <p class="text-2xl font-bold text-blue-600">{{ monthlyUsage.current }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-gray-700">Status</h4>
                        <p class="text-lg font-medium text-gray-600">Siap Mengajukan</p>
                        <p class="text-xs text-gray-500">Pilih barang yang ingin diajukan</p>
                    </div>
                </div>
                <div v-if="userStore.isAdmin" class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-blue-600 h-3 rounded-full" :style="{ width: monthlyUsage.percentage + '%' }">
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">{{ monthlyUsage.percentage }}% tergunakan</p>
                </div>
            </div>

            <!-- Daftar Barang -->
            <div class="bg-white rounded-lg shadow p-4">
                <h2 class="text-lg font-semibold mb-4">Pilih Barang</h2>
                <div v-if="loading" class="text-center py-8 text-gray-500">
                    Memuat data barang...
                </div>
                <div v-else class="space-y-4">
                    <EnhancedBarangCard v-for="barang in enhancedBarangList" :key="barang.id_barang" :barang="barang"
                        :jumlahDipilih="barangDipilih[barang.id_barang]?.jumlah || 0" @update="updateBarangDipilih" />
                </div>
            </div>

            <!-- Ringkasan dan Submit -->
            <RingkasanPengajuan :ringkasan="ringkasanPengajuan" @submit="ajukanPengadaan" />
        </div>
    </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import EnhancedBarangCard from '@/components/pengajuan/EnhancedBarangCard.vue'
import RingkasanPengajuan from '@/components/pengajuan/RingkasanPengajuan.vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

// State
const daftarBarang = ref([])
const barangDipilih = ref({})
const userGudang = ref([])
const adminGudang = ref([])
const batasBarangData = ref([])
const monthlyLimitData = ref({ current: 0, limit: 0 })
const loading = ref(false)
const alert = ref({ message: '', type: 'success' })
const userStore = useUserStore()

const alertClass = computed(() =>
    alert.value.type === 'success'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
)

const monthlyUsage = computed(() => {
    const current = monthlyLimitData.value.current || 0
    const limit = monthlyLimitData.value.limit || 1
    const remaining = Math.max(0, limit - current)
    const percentage = Math.min(100, Math.round((current / limit) * 100))

    return { current, limit, remaining, percentage }
})

const enhancedBarangList = computed(() => {
    return daftarBarang.value.map(barang => {
        let currentStock, adminStock, batasLimit
        
        // Handle both new combined data structure and old separate data structure
        if (barang.stock_info) {
            // New combined data structure
            currentStock = barang.stock_info.user_stock || 0
            adminStock = barang.stock_info.admin_stock || 0
            batasLimit = barang.stock_info.per_barang_limit || null
        } else {
            // Old separate data structure (fallback)
            const gudangItem = userGudang.value.find(g => g.id_barang === barang.id_barang)
            currentStock = gudangItem?.jumlah_barang || 0
            
            const batasItem = batasBarangData.value.find(b => b.id_barang === barang.id_barang)
            batasLimit = batasItem?.batas_barang || null
            
            const adminGudangItem = adminGudang.value.find(g => g.id_barang === barang.id_barang)
            adminStock = adminGudangItem?.jumlah_barang || 0
        }

        // Calculate available allocation
        const availableAllocation = batasLimit ? Math.max(0, batasLimit - currentStock) : null

        // Determine status
        let status = 'available'
        let statusText = 'Tersedia'
        let statusColor = 'text-green-600'

        // Apply limit-based status if has batas data
        if (batasLimit) {
            if (currentStock >= batasLimit) {
                status = 'maxed'
                statusText = 'Batas Tercapai'
                statusColor = 'text-red-600'
            } else if (currentStock >= batasLimit * 0.8) {
                status = 'warning'
                statusText = 'Mendekati Batas'
                statusColor = 'text-yellow-600'
            }
        } else {
            // No limit: just show basic stock info
            statusText = currentStock > 0 ? 'Stok Tersedia' : 'Stok Kosong'
            statusColor = currentStock > 0 ? 'text-green-600' : 'text-gray-600'
        }

        return {
            ...barang,
            currentStock,
            adminStock,
            batasLimit,
            availableAllocation,
            status,
            statusText,
            statusColor,
            showLimitInfo: batasLimit !== null
        }
    })
})

// Fetch all required data
onMounted(async () => {
    loading.value = true
    try {
        logger.info('User: Fetching pengajuan data', {
            user: userStore.user?.username,
            branch: userStore.user?.branch_name
        })

        // Try the new combined endpoint first, fallback to old method if not available
        try {
            const response = await API.get('/pengajuan/barang-info')
            const data = response.data.data
            
            // Extract data from combined response
            daftarBarang.value = data.barang
            monthlyLimitData.value.limit = data.monthly_info.limit
            monthlyLimitData.value.current = data.monthly_info.used
            
            // Store for compatibility (some components might still need these)
            userGudang.value = data.barang.map(item => ({
                id_barang: item.id_barang,
                jumlah_barang: item.stock_info.user_stock
            }))
            
            // Admin gudang data (if available)
            if (data.user_info.can_see_admin_stock) {
                adminGudang.value = data.barang.map(item => ({
                    id_barang: item.id_barang,
                    jumlah_barang: item.stock_info.admin_stock || 0
                }))
            } else {
                adminGudang.value = []
            }
            
            // Batas barang data
            batasBarangData.value = data.barang.map(item => ({
                id_barang: item.id_barang,
                batas_barang: item.stock_info.per_barang_limit || 0
            }))
            
            logger.info('User: Combined data loaded successfully', {
                barangCount: daftarBarang.value.length,
                monthlyLimit: monthlyLimitData.value.limit,
                monthlyUsage: monthlyLimitData.value.current,
                canSeeAdminStock: data.user_info.can_see_admin_stock
            })
        } catch (combinedError) {
            // Fallback to original multiple API calls
            logger.warn('User: Combined endpoint not available, using fallback method', { error: combinedError.message })
            
            // Fetch data that users can access
            const [barangResponse, userGudangResponse] = await Promise.all([
                API.get('/barang'),
                API.get('/gudang') // User's current stock only
            ])

            daftarBarang.value = barangResponse.data.data
            userGudang.value = userGudangResponse.data.data

            // Try to fetch admin-only data with fallbacks
            try {
                if (userStore.isAdmin) {
                    const [batasResponse, monthlyResponse] = await Promise.all([
                        API.get('/batas-barang'), // Admin-only: Allocation limits
                        API.get('/global-settings/monthly-limit') // Admin-only: Monthly limit
                    ])

                    batasBarangData.value = batasResponse.data.data
                    monthlyLimitData.value.limit = monthlyResponse.data.monthly_limit || 10
                } else {
                    // Set defaults for regular users
                    batasBarangData.value = []
                    monthlyLimitData.value.limit = 10 // Default limit
                    logger.info('User: Using defaults for non-admin user')
                }
            } catch (adminError) {
                logger.warn('User: Admin endpoints not accessible, using defaults', { error: adminError.message })
                batasBarangData.value = []
                monthlyLimitData.value.limit = 10
            }

            // Get current month's pengajuan count for this user
            try {
                const pengajuanResponse = await API.get('/pengajuan', {
                    params: {
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear()
                    }
                })

                monthlyLimitData.value.current = pengajuanResponse.data.data?.length || 0
            } catch (pengajuanError) {
                logger.warn('User: Could not fetch pengajuan history', { error: pengajuanError.message })
                monthlyLimitData.value.current = 0
            }
            
            // Set empty admin gudang for fallback
            adminGudang.value = []
            
            logger.info('User: Fallback data loaded successfully', {
                barangCount: daftarBarang.value.length,
                monthlyLimit: monthlyLimitData.value.limit,
                monthlyUsage: monthlyLimitData.value.current
            })
        }

        logger.info('User: All pengajuan data loaded successfully', {
            barangCount: daftarBarang.value.length,
            gudangCount: userGudang.value.length,
            batasCount: batasBarangData.value.length,
            monthlyUsage: monthlyLimitData.value,
            user: userStore.user?.username
        })
    } catch (err) {
        logger.error('User: Failed to fetch pengajuan data', {
            error: err.message,
            response: err.response?.data,
            user: userStore.user?.username
        })
        const errorMsg = err.response?.data?.message || 'Gagal memuat data pengajuan'
        toast.error(errorMsg)
        showAlert(errorMsg, 'error')
    } finally {
        loading.value = false
    }
})

// Update barang yang dipilih
function updateBarangDipilih({ id_barang, jumlah }) {
    logger.info('User: Updating selected barang', {
        id_barang,
        jumlah,
        user: userStore.user?.username
    })

    if (jumlah > 0) {
        barangDipilih.value[id_barang] = {
            ...daftarBarang.value.find(b => b.id_barang === id_barang),
            jumlah,
        }
    } else {
        delete barangDipilih.value[id_barang]
    }

    logger.info('User: Selected barang updated', {
        totalSelectedItems: Object.keys(barangDipilih.value).length,
        user: userStore.user?.username
    })
}

// Ringkasan (array dari barangDipilih)
const ringkasanPengajuan = computed(() =>
    Object.values(barangDipilih.value)
)

// Submit ke backend
async function ajukanPengadaan() {
    if (ringkasanPengajuan.value.length === 0) {
        logger.warn('User: Attempted to submit empty pengajuan', {
            user: userStore.user?.username
        })
        toast.error('Pilih minimal satu barang')
        return
    }

    // Check monthly limit first (admin-only feature)
    if (userStore.isAdmin && monthlyUsage.value.current >= monthlyUsage.value.limit) {
        const errorMsg = `Anda sudah mencapai batas maksimal ${monthlyUsage.value.limit} pengajuan bulan ini`
        toast.error(errorMsg)
        showAlert(errorMsg, 'error')
        return
    }

    // Validate allocation limits (admin-only feature)
    if (userStore.isAdmin) {
        const allocationErrors = []
        ringkasanPengajuan.value.forEach(item => {
            const barangData = enhancedBarangList.value.find(b => b.id_barang === item.id_barang)
            if (barangData?.availableAllocation && item.jumlah > barangData.availableAllocation) {
                allocationErrors.push(`${barangData.nama_barang}: melebihi batas yang tersedia (maks: ${barangData.availableAllocation})`)
            }
        })

        if (allocationErrors.length > 0) {
            const errorMsg = 'Pengajuan tidak valid:\n' + allocationErrors.join('\n')
            toast.error(errorMsg)
            showAlert(errorMsg, 'error')
            return
        }
    }

    loading.value = true
    const pengajuanId = 'PGJ' + Date.now()

    try {
        logger.info('User: Starting pengajuan submission', {
            pengajuanId,
            itemCount: ringkasanPengajuan.value.length,
            user: userStore.user?.username,
            branch: userStore.user?.branch_name,
            items: ringkasanPengajuan.value.map(item => ({
                id_barang: item.id_barang,
                nama_barang: item.nama_barang,
                jumlah: item.jumlah
            }))
        })

        // ✅ Send complete pengajuan with items in single request
        await API.post('/pengajuan', {
            id_pengajuan: pengajuanId,
            unique_id: userStore.user.unique_id,
            status_pengajuan: 'Menunggu Persetujuan',
            tipe_pengajuan: 'biasa',
            keterangan: 'Pengajuan barang dari web app',
            items: ringkasanPengajuan.value.map(item => ({
                id_barang: item.id_barang,
                jumlah: item.jumlah
            }))
        })

        logger.info('User: Pengajuan submitted successfully', {
            pengajuanId,
            totalItems: ringkasanPengajuan.value.length,
            user: userStore.user?.username,
            branch: userStore.user?.branch_name
        })

        toast.success('Pengajuan berhasil diajukan.')
        barangDipilih.value = {} // reset form
        showAlert('Pengajuan berhasil diajukan', 'success')

    } catch (err) {
        logger.error('User: Failed to submit pengajuan', {
            error: err.message,
            response: err.response?.data,
            pengajuanId,
            user: userStore.user?.username,
            itemCount: ringkasanPengajuan.value.length
        })

        const errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan'
        toast.error(errorMsg)
        showAlert(errorMsg, 'error')
    } finally {
        loading.value = false
    }
}

const showAlert = (message, type = 'success') => {
    logger.info('User: Showing alert', { message, type })
    alert.value = { message, type }
    setTimeout(() => (alert.value.message = ''), 3000)
}
</script>
