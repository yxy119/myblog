import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

console.log('SUPABASE URL =', import.meta.env.VITE_SUPABASE_URL)

const app = createApp(App)
app.use(router)
app.mount('#app')

