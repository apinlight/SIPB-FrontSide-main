<!-- src/components/BaseButton.vue -->
<template>
  <button
    :class="[
      'px-4 py-2 rounded font-medium transition-all duration-200',
      variant === 'primary' ? 'bg-green-600 text-white hover:bg-green-700' : '',
      variant === 'secondary' ? 'bg-gray-300 text-black hover:bg-gray-400' : '',
      variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : '',
      variant === 'outline' ? 'border border-gray-400 text-gray-700 hover:bg-gray-100' : ''
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' }
})
</script>