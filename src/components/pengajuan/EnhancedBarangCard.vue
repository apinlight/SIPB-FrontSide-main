<!-- src/components/pengajuan/EnhancedBarangCard.vue -->
<template>
    <div class="border rounded-lg p-4 shadow-sm" :class="cardBorderClass">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <!-- Barang Info -->
            <div class="md:col-span-4">
                <h3 class="font-semibold text-lg">{{ barang.nama_barang }}</h3>
                <p class="text-sm text-gray-600">{{ barang.jenis_barang?.nama_jenis || 'No Category' }}</p>
                <p class="text-sm text-gray-500">Harga: Rp {{ formatCurrency(barang.harga_satuan) }}</p>
            </div>

            <!-- Stock Information -->
            <div class="md:col-span-5 space-y-2">
                <!-- Admin view: Full allocation info -->
                <div v-if="barang.showLimitInfo" class="grid grid-cols-3 gap-2 text-sm">
                    <div class="text-center">
                        <p class="text-gray-500">Stok Saat Ini</p>
                        <p class="font-semibold text-lg">{{ barang.currentStock }}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-500">Batas Maksimal</p>
                        <p class="font-semibold text-lg">{{ barang.batasLimit || 'Unlimited' }}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-500">Dapat Diminta</p>
                        <p class="font-semibold text-lg" :class="availabilityTextClass">
                            {{ barang.availableAllocation || 'Unlimited' }}
                        </p>
                    </div>
                </div>

                <!-- Regular user view: Simplified info -->
                <div v-else class="grid grid-cols-2 gap-4 text-sm">
                    <div class="text-center">
                        <p class="text-gray-500">Stok Anda Saat Ini</p>
                        <p class="font-semibold text-lg text-blue-600">{{ barang.currentStock }}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-gray-500">Status</p>
                        <p class="font-semibold text-lg" :class="barang.statusColor">{{ barang.statusText }}</p>
                    </div>
                </div>

                <!-- Progress Bar (admin only, if has limit) -->
                <div v-if="barang.showLimitInfo && barang.batasLimit" class="w-full">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-300" :class="progressBarClass"
                            :style="{ width: allocationPercentage + '%' }"></div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">{{ allocationPercentage }}% tergunakan</p>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center gap-2">
                    <span v-if="barang.showLimitInfo" class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="statusBadgeClass">
                        {{ barang.statusText }}
                    </span>
                    <span v-if="maxRequestWarning" class="text-xs text-red-600">
                        {{ maxRequestWarning }}
                    </span>
                </div>
            </div>

            <!-- Input Section -->
            <div class="md:col-span-3 flex flex-col items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Jumlah</label>
                <input type="number" min="0" :max="maxAllowedInput" :disabled="isMaxedOut"
                    class="w-20 rounded border px-2 py-1 text-center" :class="inputClass" v-model.number="jumlah"
                    @change="updateJumlah" />
                <p v-if="maxAllowedInput" class="text-xs text-gray-500">
                    Maks: {{ maxAllowedInput }}
                </p>
                <p v-if="validationError" class="text-xs text-red-600">
                    {{ validationError }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    barang: Object,
    jumlahDipilih: Number,
})
const emit = defineEmits(['update'])

const jumlah = ref(props.jumlahDipilih || 0)

watch(() => props.jumlahDipilih, (val) => {
    jumlah.value = val
})

// Computed properties
const isMaxedOut = computed(() => {
    return props.barang.status === 'maxed'
})

const maxAllowedInput = computed(() => {
    return props.barang.availableAllocation || null
})

const allocationPercentage = computed(() => {
    if (!props.barang.batasLimit) return 0
    return Math.min(100, Math.round((props.barang.currentStock / props.barang.batasLimit) * 100))
})

const cardBorderClass = computed(() => {
    switch (props.barang.status) {
        case 'maxed': return 'border-red-300 bg-red-50'
        case 'warning': return 'border-yellow-300 bg-yellow-50'
        default: return 'border-gray-200 bg-white'
    }
})

const availabilityTextClass = computed(() => {
    switch (props.barang.status) {
        case 'maxed': return 'text-red-600'
        case 'warning': return 'text-yellow-600'
        default: return 'text-green-600'
    }
})

const progressBarClass = computed(() => {
    if (allocationPercentage.value >= 100) return 'bg-red-500'
    if (allocationPercentage.value >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
})

const statusBadgeClass = computed(() => {
    switch (props.barang.status) {
        case 'maxed': return 'bg-red-100 text-red-800'
        case 'warning': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-green-100 text-green-800'
    }
})

const inputClass = computed(() => {
    if (isMaxedOut.value) return 'bg-gray-100 cursor-not-allowed'
    if (validationError.value) return 'border-red-300 focus:ring-red-500'
    return 'focus:ring-green-500'
})

const validationError = computed(() => {
    if (jumlah.value <= 0) return null
    if (maxAllowedInput.value && jumlah.value > maxAllowedInput.value) {
        return `Melebihi batas yang tersedia`
    }
    return null
})

const maxRequestWarning = computed(() => {
    if (isMaxedOut.value) return 'Tidak dapat mengajukan lagi'
    return null
})

// Methods
function updateJumlah() {
    // Validate before emitting
    if (validationError.value) {
        jumlah.value = Math.min(jumlah.value, maxAllowedInput.value || jumlah.value)
    }

    emit('update', { id_barang: props.barang.id_barang, jumlah: jumlah.value })
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID').format(amount || 0)
}
</script>
