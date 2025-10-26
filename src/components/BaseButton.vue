<!-- src/components/BaseButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
    class="touch-manipulation"
  >
    <!-- Loading spinner -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      :class="sizeIconClass"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    
    <!-- Icon (optional) -->
    <span v-if="icon && !loading" class="flex-shrink-0" :class="{ 'mr-2': $slots.default }">
      {{ icon }}
    </span>
    
    <!-- Button text/content -->
    <span v-if="$slots.default">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { 
    type: String, 
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'danger', 'outline', 'ghost'].includes(val)
  },
  size: { 
    type: String, 
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  icon: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
});

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size classes - ensuring minimum 44x44px touch target
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400 active:bg-gray-500 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm',
    outline: 'border-2 border-gray-400 text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300'
  };
  
  const widthClass = props.fullWidth ? 'w-full' : '';
  
  return `${base} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${widthClass}`;
});

const sizeIconClass = computed(() => {
  return {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[props.size];
});
</script>