<!-- src/components/SidebarLink.vue -->
<template>
  <div>
    <!-- Item utama -->
    <RouterLink
      v-if="item.path"
      :to="item.path"
      @click="$emit('navigate')"
      class="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg transition-all touch-manipulation min-h-[44px]"
      :class="{
        'bg-green-600 text-white shadow-md': isActive,
        'text-gray-700 hover:bg-green-50 active:bg-green-100': !isActive
      }"
    >
      <span class="text-xl min-w-[24px] flex-shrink-0">{{ item.emoji }}</span>
      <span v-if="!collapsed" class="flex-1 font-medium">{{ item.name }}</span>
      <span v-if="item.children && !collapsed" class="text-sm transition-transform" :class="{ 'rotate-90': open }">
        ▸
      </span>
    </RouterLink>
    <div
      v-else
      @click="handleClick"
      class="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg transition-all touch-manipulation min-h-[44px]"
      :class="{
        'bg-green-600 text-white shadow-md': isActive,
        'text-gray-700 hover:bg-green-50 active:bg-green-100': !isActive
      }"
    >
      <span class="text-xl min-w-[24px] flex-shrink-0">{{ item.emoji }}</span>
      <span v-if="!collapsed" class="flex-1 font-medium">{{ item.name }}</span>
      <span v-if="item.children && !collapsed" class="text-sm transition-transform" :class="{ 'rotate-90': open }">
        ▸
      </span>
    </div>

    <!-- Submenu -->
    <transition name="submenu">
      <div
        v-if="item.children && open && !collapsed"
        class="ml-8 mt-1 space-y-1 overflow-hidden"
      >
        <RouterLink
          v-for="child in item.children"
          :key="child.path"
          :to="child.path"
          @click="$emit('navigate')"
          class="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all touch-manipulation min-h-[40px]"
          :class="{
            'bg-green-500 text-white font-medium shadow-sm': route.path === child.path,
            'text-gray-600 hover:bg-green-50 active:bg-green-100': route.path !== child.path
          }"
        >
          <span class="text-base">{{ child.emoji || '•' }}</span>
          <span>{{ child.name }}</span>
        </RouterLink>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: Object,
  collapsed: Boolean
})

defineEmits(['navigate']);

const route = useRoute()
const open = ref(false)

const handleClick = () => {
  if (props.item.children) {
    open.value = !open.value
  }
}

const isActive = computed(() => {
  if (props.item.path) return route.path === props.item.path
  if (props.item.children) {
    return props.item.children.some((child) => route.path === child.path)
  }
  return false
})
</script>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>