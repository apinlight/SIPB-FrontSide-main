<!-- src/components/SidebarLink.vue -->
<template>
  <div>
    <!-- Item utama -->
    <RouterLink
      v-if="item.path"
      :to="item.path"
      class="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
      :class="{
        'bg-green-600 text-white': isActive,
        'text-gray-700 hover:bg-green-100': !isActive
      }"
    >
      <span class="text-xl">{{ item.emoji }}</span>
      <span v-if="!collapsed">{{ item.name }}</span>
      <span v-if="item.children && !collapsed" class="ml-auto text-sm">
        {{ open ? '▾' : '▸' }}
      </span>
    </RouterLink>
    <div
      v-else
      @click="handleClick"
      class="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
      :class="{
        'bg-green-600 text-white': isActive,
        'text-gray-700 hover:bg-green-100': !isActive
      }"
    >
      <span class="text-xl">{{ item.emoji }}</span>
      <span v-if="!collapsed">{{ item.name }}</span>
      <span v-if="item.children && !collapsed" class="ml-auto text-sm">
        {{ open ? '▾' : '▸' }}
      </span>
    </div>

    <!-- Submenu -->
    <div
      v-if="item.children && open && !collapsed"
      class="ml-6 mt-1 space-y-1"
    >
      <RouterLink
        v-for="child in item.children"
        :key="child.path"
        :to="child.path"
        class="block text-sm px-2 py-1 rounded hover:bg-green-100"
        :class="{
          'bg-green-600 text-white': route.path === child.path,
          'text-gray-700': route.path !== child.path
        }"
      >
        <span class="mr-2">{{ child.emoji || '•' }}</span>
        {{ child.name }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: Object,
  collapsed: Boolean
})

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