import axios from "axios";

// Helper to determine the correct API URL
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Remove trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Append /api/v1 if not already present
  if (!url.endsWith('/api/v1')) {
    url += '/api/v1';
  }

  return url;
};

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});
