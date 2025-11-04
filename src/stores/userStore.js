import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import router from '@/router';
import { logger } from '@/lib/logger';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('auth_user')) || null,
        token: localStorage.getItem('auth_token') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        // Normalize roles to string array to support both ['admin'] and [{ name: 'admin' }]
        userRoles: (state) => {
            const roles = state.user?.roles || [];
            return roles
                .map(r => typeof r === 'string' ? r : r?.name)
                .filter(Boolean);
        },
        isAdmin(state) { return this.userRoles.includes('admin') || this.userRoles.includes('superadmin'); },
        isManager(state) { return this.userRoles.includes('manager'); },
    },

    actions: {
        async login(credentials) {
            try {
                // ✅ This now calls the correct endpoint: https://.../api/v1/login
                const response = await apiClient.post('/login', credentials);
                const { user, token } = response.data;
                this.setAuthData(user, token);
                await router.push({ name: 'Dashboard' });
            } catch (error) {
                logger.error('Login failed:', error.response?.data?.message || error.message);
                throw error;
            }
        },

        async logout() {
            if (!this.token) return;
            logger.auth.logout();
            try {
                // ✅ This now calls the correct endpoint: https://.../api/v1/logout
                await apiClient.post('/logout', {});
            } catch (error) {
                logger.error('Logout API call failed, proceeding.', error);
            } finally {
                this.clearAuthData();
                await router.push({ name: 'Login' });
            }
        },

        async checkAuth() {
            if (this.isAuthenticated) {
                try {
                logger.info('Checking auth status with server...');
                // Make an API call to a protected route to validate the token
                const response = await apiClient.get('/profile'); 
                // If successful, the token is valid. We can optionally refresh user data.
                this.user = response.data.data;
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                } catch (error) {
                logger.error('Auth check failed, token might be invalid.', error);
                // If the token is invalid, our api.js interceptor will automatically
                // catch the 401 error and call the logout() action.
                }
            }
        },

        setAuthData(user, token) {
            this.user = user;
            this.token = token;
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);
            logger.info('UserStore: Auth data set', { username: user.username });
        },

        clearAuthData() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
        },

        async updateProfile(profileData) {
            try {
                logger.info('Updating user profile...', { username: profileData.username });
                const response = await apiClient.put('/profile', profileData);
                
                // Update local user data
                const updatedUser = response.data.data;
                this.user = updatedUser;
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                
                logger.info('Profile updated successfully');
                return { success: true, data: updatedUser };
            } catch (error) {
                logger.error('Failed to update profile:', error);
                const errorMsg = error.response?.data?.message || 'Gagal memperbarui profil';
                return { success: false, error: errorMsg };
            }
        }
    }
});