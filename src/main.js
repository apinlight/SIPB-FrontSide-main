import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

// ✅ Import toastify CSS
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
const pinia = createPinia()
// ✅ Explicitly set active pinia to avoid timing issues across guards/async imports
setActivePinia(pinia)

// ✅ CRITICAL: Install Pinia BEFORE router to avoid timing issues
app.use(pinia)
app.use(router)

app.mount('#app')
