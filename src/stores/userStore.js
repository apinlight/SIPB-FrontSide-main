import { defineStore } from 'pinia';
import apiClient from '@/lib/api'; // 1. Import our new API service
import router from '@/router'; // 2. Import the router for redirects
import { logger } from '@/lib/logger';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('auth_user')) || null,
        token: localStorage.getItem('auth_token') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        userRoles: (state) => state.user?.roles || [],
        isAdmin(state) {
            return this.userRoles.includes('admin');
        },
        isManager(state) {
            return this.userRoles.includes('manager');
        },
    },

    actions: {
        /**
         * The main action for logging in. It calls the API and, on success,
         * commits the authentication data to the store.
         * @param {object} credentials - { login, password }
         */
        async login(credentials) {
            try {
                const response = await apiClient.post('/login', credentials);
                const { user, token } = response.data;
                this.setAuthData(user, token);
                
                // Redirect to the dashboard after successful login
                await router.push({ name: 'Dashboard' });
            } catch (error) {
                logger.error('Login failed:', error.response?.data?.message || error.message);
                // Re-throw the error so the component can display a message
                throw error;
            }
        },

        /**
         * The main action for logging out. This is the single source of truth
         * for logging out, called from components and the api.js interceptor.
         */
        async logout() {
            if (!this.token) return; // Avoid running if already logged out

            logger.auth.logout();
            try {
                // Inform the backend that the token is being logged out
                await apiClient.post('/logout');
            } catch (error) {
                logger.error('Logout API call failed, proceeding with client-side logout.', error);
            } finally {
                // Always clear client-side data, even if the API call fails
                this.clearAuthData();
                // Redirect to the login page
                await router.push({ name: 'Login' });
            }
        },

        /**
         * A private helper action to centralize setting auth data.
         * @param {object} user - The user object from the API
         * @param {string} token - The bearer token from the API
         */
        setAuthData(user, token) {
            this.user = user;
            this.token = token;
            
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);
            
            logger.info('UserStore: Auth data set', { username: user.username });
        },

        /**
         * A private helper action to centralize clearing auth data.
         */
        clearAuthData() {
            this.user = null;
            this.token = null;

            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
        },
        
        /**
         * An initialization action to check if the stored token is still valid.
         * This should be called when the application first loads (in App.vue or main.js).
         */
        async checkAuth() {
            if (this.isAuthenticated) {
                try {
                    logger.info('Checking auth status with server...');
                    const response = await apiClient.get('/profile');
                    // If the server confirms the user, update the user data
                    this.setUser(response.data);
                } catch (error) {
                    logger.error('Auth check failed, token might be invalid.', error);
                    // The 401 interceptor in api.js will automatically call logout()
                }
            }
        },

        /**
         * Action to update the user data in the store (e.g., after a profile update).
         */
        setUser(userData) {
             this.user = userData;
             localStorage.setItem('auth_user', JSON.stringify(userData));
        }
    }
});