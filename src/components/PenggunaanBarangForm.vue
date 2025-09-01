<template>
  <div class="bg-white p-6 rounded-xl shadow">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      {{ isEdit ? 'Edit Penggunaan Barang' : 'Tambah Penggunaan Barang' }}
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Pilih Barang -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Pilih Barang <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.id_barang"
          @change="onBarangChange"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
          :disabled="isEdit"
        >
          <option value="">-- Pilih Barang --</option>
          <option 
            v-for="item in availableStock" 
            :key="item.id_barang" 
            :value="item.id_barang"
            :disabled="item.jumlah_tersedia === 0"
          >
            {{ item.nama_barang }} (Stok: {{ item.jumlah_tersedia }})
          </option>
        </select>
      </div>

      <!-- Info Stok -->
      <div v-if="selectedStock" class="bg-blue-50 p-3 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>Stok Tersedia:</strong> {{ selectedStock.jumlah_tersedia }} unit
        </p>
        <p class="text-sm text-blue-600">
          {{ selectedStock.nama_barang }} - {{ selectedStock.jenis_barang }}
        </p>
      </div>

      <!-- Jumlah Digunakan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Digunakan <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.jumlah_digunakan"
          type="number"
          min="1"
          :max="selectedStock?.jumlah_tersedia || 999"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <p v-if="selectedStock && form.jumlah_digunakan > selectedStock.jumlah_tersedia" 
           class="text-red-500 text-sm mt-1">
          Jumlah melebihi stok yang tersedia!
        </p>
      </div>

      <!-- Keperluan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Keperluan <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.keperluan"
          type="text"
          maxlength="255"
          placeholder="Contoh: Maintenance rutin, Perbaikan AC, dll"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Tanggal Penggunaan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Penggunaan <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.tanggal_penggunaan"
          type="date"
          :max="today"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Keterangan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Keterangan (Opsional)
        </label>
        <textarea
          v-model="form.keterangan"
          rows="3"
          maxlength="1000"
          placeholder="Keterangan tambahan..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4">
        <BaseButton 
          type="submit" 
          variant="primary"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
        </BaseButton>
        <BaseButton 
          type="button" 
          variant="secondary"
          @click="resetForm"
        >
          Reset
        </BaseButton>
        <BaseButton 
          v-if="isEdit"
          type="button" 
          variant="outline"
          @click="$emit('cancel')"
        >
          Batal
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import BaseButton from '@/components/BaseButton.vue'
import { usePenggunaanBarangStore } from '@/stores/penggunaanBarangStore'

const props = defineProps({
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

const penggunaanStore = usePenggunaanBarangStore()
const isLoading = ref(false)

// Form data
const form = ref({
  id_barang: '',
  jumlah_digunakan: 1,
  keperluan: '',
  tanggal_penggunaan: new Date().toISOString().split('T')[0],
  keterangan: ''
})

// Computed
const isEdit = computed(() => !!props.editData)
const availableStock = computed(() => penggunaanStore.availableStock)
const today = computed(() => new Date().toISOString().split('T')[0])

const selectedStock = computed(() => {
  if (!form.value.id_barang) return null
  return availableStock.value.find(item => item.id_barang === form.value.id_barang)
})

const isFormValid = computed(() => {
  return form.value.id_barang && 
         form.value.jumlah_digunakan > 0 && 
         form.value.keperluan.trim() && 
         form.value.tanggal_penggunaan &&
         (!selectedStock.value || form.value.jumlah_digunakan <= selectedStock.value.jumlah_tersedia)
})

// Methods
const onBarangChange = () => {
  // Reset jumlah when barang changes
  form.value.jumlah_digunakan = 1
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Mohon lengkapi semua field yang diperlukan')
    return
  }

  isLoading.value = true
  try {
    if (isEdit.value) {
      // Update logic would go here
      toast.success('Penggunaan barang berhasil diupdate')
    } else {
      await penggunaanStore.createPenggunaan(form.value)
      toast.success('Penggunaan barang berhasil dicatat')
      resetForm()
    }
    emit('success')
  } catch (error) {
    toast.error(error.message || 'Gagal menyimpan data')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    id_barang: '',
    jumlah_digunakan: 1,
    keperluan: '',
    tanggal_penggunaan: new Date().toISOString().split('T')[0],
    keterangan: ''
  }
}

// Load edit data
watch(() => props.editData, (newData) => {
  if (newData) {
    form.value = {
      id_barang: newData.id_barang,
      jumlah_digunakan: newData.jumlah_digunakan,
      keperluan: newData.keperluan,
      tanggal_penggunaan: newData.tanggal_penggunaan,
      keterangan: newData.keterangan || ''
    }
  }
}, { immediate: true })

// Load available stock on mount
onMounted(async () => {
  try {
    await penggunaanStore.fetchAvailableStock()
  } catch (error) {
    toast.error('Gagal memuat data stok')
  }
})
</script>