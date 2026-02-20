import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.message
        console.error('API Error:', message)
        return Promise.reject(error)
    }
)

export default api
