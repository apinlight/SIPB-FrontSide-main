<template>
    <DefaultLayout>
        <div class="p-6">
            <h1 class="text-2xl font-bold">📋 Batas Pengajuan Bulanan</h1>
            </div>
    </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengaturanStore } from '@/stores/pengaturanStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

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