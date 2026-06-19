import axios from 'axios';
import { logout, setAccessToken } from '../features/auth/authSlice';

let store;

export const injectStore = _store => {
  store = _store;
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/api/v1' });

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, { refreshToken });
          store.dispatch(setAccessToken(data.data.accessToken));
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          store.dispatch(logout());
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
