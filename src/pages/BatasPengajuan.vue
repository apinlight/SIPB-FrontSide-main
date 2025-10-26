<template>
    <DefaultLayout>
        <div class="p-4 sm:p-6 space-y-6">
            <div class="bg-white p-6 rounded-xl shadow">
                <h1 class="text-2xl font-bold text-gray-800">📋 Batas Pengajuan Bulanan</h1>
                <p class="text-gray-600 mt-1">Atur jumlah maksimal pengajuan per user per bulan</p>
            </div>

            <div v-if="loading" class="text-center py-10">Memuat data...</div>

            <div v-else class="bg-white rounded-xl shadow p-6 space-y-6">
                <!-- Current Settings -->
                <div class="border-b pb-6">
                    <h2 class="text-lg font-semibold mb-4">Pengaturan Saat Ini</h2>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">Batas Pengajuan Per Bulan</p>
                                <p class="text-3xl font-bold text-green-600">{{ monthlyLimit }}</p>
                                <p class="text-xs text-gray-500 mt-1">pengajuan per user per bulan</p>
                            </div>
                            <BaseButton variant="secondary" @click="showForm = true">
                                ✏️ Edit Batas
                            </BaseButton>
                        </div>
                    </div>
                </div>

                <!-- Statistics (if available) -->
                <div v-if="pengajuanStats">
                    <h2 class="text-lg font-semibold mb-4">Statistik Pengajuan Bulan Ini</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p class="text-sm text-gray-600">Total Pengajuan</p>
                            <p class="text-2xl font-bold text-blue-600">{{ pengajuanStats.total || 0 }}</p>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p class="text-sm text-gray-600">Menunggu</p>
                            <p class="text-2xl font-bold text-yellow-600">{{ pengajuanStats.pending || 0 }}</p>
                        </div>
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="text-sm text-gray-600">Disetujui</p>
                            <p class="text-2xl font-bold text-green-600">{{ pengajuanStats.approved || 0 }}</p>
                        </div>
                    </div>
                </div>

                <!-- Info -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-700 mb-2">ℹ️ Catatan Penting</h3>
                    <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Batas ini berlaku untuk semua user (kecuali admin)</li>
                        <li>User yang melebihi batas tidak dapat membuat pengajuan baru</li>
                        <li>Batas akan direset setiap awal bulan</li>
                        <li>Admin tidak dibatasi jumlah pengajuan</li>
                    </ul>
                </div>
            </div>

            <!-- Edit Form Modal -->
            <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showForm = false">
                <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full" @click.stop>
                    <h2 class="text-xl font-bold mb-4">Edit Batas Pengajuan</h2>
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Batas Pengajuan Per Bulan</label>
                            <input 
                                v-model.number="formLimit" 
                                type="number" 
                                min="1" 
                                max="100"
                                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                required 
                            />
                            <small class="text-gray-500">Nilai antara 1 - 100 pengajuan per bulan</small>
                        </div>
                        <div class="flex gap-2">
                            <BaseButton type="submit" variant="primary" fullWidth>Simpan</BaseButton>
                            <BaseButton type="button" variant="secondary" @click="showForm = false" fullWidth>Batal</BaseButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengaturanStore } from '@/stores/pengaturanStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BaseButton from '@/components/BaseButton.vue';

const store = usePengaturanStore();
const { monthlyLimit, pengajuanStats, loading } = storeToRefs(store);

const showForm = ref(false);
const formLimit = ref(0);

onMounted(async () => {
    await store.fetchBatasPengajuan();
    formLimit.value = monthlyLimit.value;
});

const handleSubmit = async () => {
    const success = await store.saveBatasPengajuan(formLimit.value);
    if (success) showForm.value = false;
}
</script>