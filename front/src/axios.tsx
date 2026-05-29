import axios from 'axios'

const service = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
})

// Добавляем токен в каждый запрос
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // или 'accessToken'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Обработка ответов (опционально)
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Если токен просрочен (401) - можно сделать logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject(error)
  },
)

export default service
