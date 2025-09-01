# AGENT.md - SIPB Frontend Development Guide

## Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - Build for production
- **Preview**: `npm run preview` - Preview production build
- **No test script configured** - Add tests if needed

## Architecture
- **Vue 3** frontend with Composition API (`<script setup>`)
- **Vite** build tool with HMR
- **Pinia** for state management (userStore, loadingStore, pengunaanBarangStore)
- **Vue Router** with role-based navigation guards
- **Tailwind CSS** for styling
- **Axios** for API calls with Bearer token auth
- **API**: RESTful endpoints at `/api/v1/*`, auth at `/api/login`

## Code Style
- **Naming**: PascalCase for components, camelCase for composables/stores
- **Imports**: Use `@/` alias for src directory
- **Components**: Single File Components with `<script setup>`
- **Props**: Use `defineProps()` with type validation
- **API**: Use central `src/lib/api.js` instance with interceptors
- **State**: Pinia stores with getters for computed values
- **Styling**: Tailwind classes, avoid custom CSS unless necessary
- **Error Handling**: Use `vue3-toastify` for user notifications and `src/lib/logger.js` for debugging

## Component Split Criteria
**Keep comprehensive pages until they exceed:**
- **Primary**: >400 lines OR >3 core workflows OR >2 user role interfaces OR >5 API calls on mount
- **Secondary**: >15 conditionals OR >8 form fields OR >6 reactive variables OR >8 child components
