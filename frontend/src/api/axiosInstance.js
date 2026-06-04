import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// We'll set the store reference after store creation to avoid circular imports
let storeRef = null;

export const setStore = (store) => {
  storeRef = store;
};

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    if (storeRef) {
      const state = storeRef.getState();
      const token = state.auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with silent token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not a refresh request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh-token') &&
      !originalRequest.url.includes('/login')
    ) {
      if (isRefreshing) {
        // Queue failed requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;

        // Store rotated refresh token
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        // Update Redux store
        if (storeRef) {
          const { setAccessToken } = await import('../features/auth/authSlice');
          storeRef.dispatch(setAccessToken(newToken));
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Logout user
        if (storeRef) {
          storeRef.dispatch({ type: 'auth/clearCredentials' });
        }
        localStorage.removeItem('refreshToken');

        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response && error.response.status !== 401) {
      // Show toast for generic API errors
      const message = error.response.data?.message || 'An unexpected error occurred';
      const isValidationError = error.response.status === 400 && error.response.data?.errors;
      
      if (error.response.status >= 500 || !isValidationError) {
        toast.error(message);
      }
    } else if (!error.response && error.message !== 'canceled') {
      toast.error('Network Error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
