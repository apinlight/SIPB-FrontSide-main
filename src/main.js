import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

console.log('--- ENV DEBUG ---');
console.log('Mode:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('-----------------');

// ✅ Toast: plugin + CSS
import Toast from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
const pinia = createPinia()
// ✅ Explicitly set active pinia to avoid timing issues across guards/async imports
setActivePinia(pinia)

// ✅ CRITICAL: Install Pinia BEFORE router to avoid timing issues
app.use(pinia)
app.use(router)

// ✅ Configure global toast position: bottom-center on mobile, top-right on desktop
const toastPosition = (typeof window !== 'undefined' && window.innerWidth < 768)
	? 'bottom-center'
	: 'top-right'
app.use(Toast, {
	position: toastPosition,
	autoClose: 3000,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
})

app.mount('#app')
