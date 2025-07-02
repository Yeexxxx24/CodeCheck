// import { createApp } from 'vue'
// // import './style.css'
// import App from './App.vue'
// import router from './router'
// import { createPinia } from 'pinia'

// const app = createApp(App)
// app.use(router)
// app.use(createPinia)
// app.mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())    // 使用 Pinia 状态管理
app.use(router)           // 使用 vue-router
app.use(ElementPlus)      // 使用 Element Plus UI 框架

app.mount('#app')         // 挂载到 index.html 里的 <div id="app">
