import './styles.css'

import App from './App.vue'
import { initRouter } from './router'
import { createSSRApp } from 'vue'

const app = createSSRApp(App)
const router = initRouter(false)
app.use(router)

app.mount('#app')
