<template>
    <DefaultLayout>
        <div class="p-4 sm:p-6 space-y-6">
            <div class="bg-white p-6 rounded-xl shadow">
                <h1 class="text-2xl font-bold text-gray-800">📝 Pengajuan Pengadaan Barang</h1>
                <p class="text-gray-600 mt-1">Ajukan permintaan pengadaan barang baru</p>
            </div>

            <div v-if="error" class="p-3 rounded mb-4 bg-red-100 text-red-800 border-red-200">
                {{ error }}
            </div>

                <div class="bg-white rounded-xl shadow p-4 sm:p-6">
                    <h3 class="text-lg font-semibold mb-3">📊 Status Pengajuan Bulanan Anda</h3>
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
                    </div>
                </div>
                <div v-if="userStore.isAdmin" class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-blue-600 h-3 rounded-full" :style="{ width: monthlyUsage.percentage + '%' }"></div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">{{ monthlyUsage.percentage }}% tergunakan</p>
                </div>
            </div>

                <div class="bg-white rounded-xl shadow p-4 sm:p-6">
                    <h2 class="text-lg font-semibold mb-4">🛒 Pilih Barang</h2>
                <div v-if="loading" class="text-center py-8 text-gray-500">
                    Memuat data barang...
                </div>
                <div v-else class="space-y-4">
                    <EnhancedBarangCard 
                        v-for="barang in barangList" 
                        :key="barang.id_barang" 
                        :barang="barang"
                        :jumlahDipilih="selectedItems[barang.id_barang]?.jumlah || 0"
                        @update="updateSelectedItem" 
                    />
                </div>
            </div>

            <RingkasanPengajuan 
                :ringkasan="summaryList" 
                @submit="submitPengajuan" 
            />
        </div>
    </DefaultLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import EnhancedBarangCard from '@/components/pengajuan/EnhancedBarangCard.vue';
import RingkasanPengajuan from '@/components/pengajuan/RingkasanPengajuan.vue';
import { useUserStore } from '@/stores/userStore';
import { usePengajuanStore } from '@/stores/pengajuanStore'; // ✅ Import the new store

// --- STORES ---
const userStore = useUserStore();
const pengajuanStore = usePengajuanStore();

// ✅ Get state and actions from the store. They are all reactive and ready to use.
const { barangList, selectedItems, monthlyUsage, summaryList, loading, error } = storeToRefs(pengajuanStore);
const { initPageData, updateSelectedItem, submitPengajuan } = pengajuanStore;

// --- LIFECYCLE HOOK ---
// ✅ The component's only job on mount is to tell the store to get the data.
onMounted(() => {
    initPageData();
});
</script>