import axios from 'axios';
import { getActivePinia } from 'pinia';
import { logger } from './logger';

// Create a new Axios instance with the FULL base URL, including /api/v1.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Request interceptor: Get the token from the Pinia store.
apiClient.interceptors.request.use(
    async (config) => {
        logger.api.request(config.method, config.url);
        let token = null;
        const activePinia = getActivePinia();
        if (activePinia) {
            // Lazy-load the user store to allow better code-splitting of stores
            const module = await import('@/stores/userStore');
            const userStore = module.useUserStore();
            token = userStore.token;
        } else {
            // Fallback to localStorage if Pinia hasn't been activated yet
            token = localStorage.getItem('auth_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            logger.auth.tokenAttached();
        }
        return config;
    },
    (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor: Delegate logout logic to the Pinia store.
apiClient.interceptors.response.use(
    (response) => {
        logger.api.response(response.config.method, response.config.url, response.status);
        return response;
    },
    async (error) => {
        logger.api.error(
            error.config?.method,
            error.config?.url,
            error.response?.status,
            error.response?.data?.message || error.message
        );
        
        if (error.response?.status === 401) {
            logger.auth.tokenExpired();
            const activePinia = getActivePinia();
            if (activePinia) {
                const module = await import('@/stores/userStore');
                const userStore = module.useUserStore();
                userStore.logout();
            } else {
                // Fallback: clear tokens and reload to login
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                // Optional: window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;