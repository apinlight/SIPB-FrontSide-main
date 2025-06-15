<!-- src/pages/user/PengajuanBarang.vue -->
<template>
  <DefaultLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">Pengajuan Pengadaan Barang</h1>

      <!-- Alert -->
      <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
        {{ alert.message }}
      </div>

      <!-- Daftar Barang -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Pilih Barang</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PilihBarangCard
            v-for="barang in daftarBarang"
            :key="barang.id_barang"
            :barang="barang"
            :jumlahDipilih="barangDipilih[barang.id_barang]?.jumlah || 0"
            @update="updateBarangDipilih"
          />
        </div>
      </div>

      <!-- Ringkasan dan Submit -->
      <RingkasanPengajuan
        :ringkasan="ringkasanPengajuan"
        @submit="ajukanPengadaan"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PilihBarangCard from '@/components/pengajuan/PilihBarangCard.vue'
import RingkasanPengajuan from '@/components/pengajuan/RingkasanPengajuan.vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

// State
const daftarBarang = ref([])
const barangDipilih = ref({})
const loading = ref(false)
const alert = ref({ message: '', type: 'success' })
const userStore = useUserStore()

const alertClass = computed(() =>
  alert.value.type === 'success'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
)

// Fetch barang dari backend
onMounted(async () => {
  try {
    logger.info('User: Fetching barang list for pengajuan', {
      user: userStore.user?.username,
      branch: userStore.user?.branch_name
    })
    
    const response = await API.get('/barang')
    daftarBarang.value = response.data.data
    
    logger.info('User: Barang list loaded successfully', {
      count: response.data.data.length,
      user: userStore.user?.username
    })
  } catch (err) {
    logger.error('User: Failed to fetch barang list', {
      error: err.message,
      response: err.response?.data,
      user: userStore.user?.username
    })
    const errorMsg = err.response?.data?.message || 'Gagal memuat data barang'
    toast.error(errorMsg)
    showAlert(errorMsg, 'error')
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
    
    // 1. Simpan ke tabel pengajuan
    await API.post('/pengajuan', {
      id_pengajuan: pengajuanId,
      unique_id: userStore.user.unique_id,
      status_pengajuan: 'Menunggu'
    })

    logger.info('User: Pengajuan header created successfully', { pengajuanId })

    // 2. Simpan ke detail-pengajuan
    for (const item of ringkasanPengajuan.value) {
      await API.post('/detail-pengajuan', {
        id_pengajuan: pengajuanId,
        id_barang: item.id_barang,
        jumlah: item.jumlah,
      })
      
      logger.info('User: Pengajuan detail item added', {
        pengajuanId,
        id_barang: item.id_barang,
        nama_barang: item.nama_barang,
        jumlah: item.jumlah
      })
    }

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
