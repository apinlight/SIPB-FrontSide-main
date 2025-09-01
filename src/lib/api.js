import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { logger } from './logger'; // We will keep your custom logger

// 1. Create a new Axios instance with a complete base URL, including the /api/v1 prefix.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// 2. Request interceptor: Keep your logger and get the token from the Pinia store.
apiClient.interceptors.request.use(
    (config) => {
        logger.api.request(config.method, config.url);
        
        // Get the Pinia store instance *inside* the interceptor.
        const userStore = useUserStore();
        const token = userStore.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            logger.auth.tokenAttached();
        }
        
        // The complex URL prefixing logic is no longer needed because of the new baseURL.
        return config;
    },
    (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// 3. Response interceptor: Keep your logger and delegate logout logic to the Pinia store.
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
        
        // On a 401 Unauthorized error, call the central logout action in the user store.
        if (error.response?.status === 401) {
            logger.auth.tokenExpired();
            const userStore = useUserStore();
            // The store will be responsible for clearing the token/user and redirecting.
            userStore.logout(); 
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;