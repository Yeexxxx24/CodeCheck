import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  // 当前前端代码里写的所有请求，其实都是发给 这个地址对应的后端服务
  baseURL: 'http://localhost:3000/api' //后端服务器的地址
})

request.interceptors.request.use((config) => {
  const store = useUserStore()
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

export default request
