import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach the JWT to every outgoing request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired access tokens by refreshing automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          { refresh }
        );
        localStorage.setItem("access_token", data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;