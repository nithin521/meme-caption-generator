import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

export default client;

export const registerUser = (data) => client.post("/api/auth/register", data);
export const loginUser = (data) => client.post("/api/auth/login", data);

export const generateCaptions = (params) => client.post("/api/captions/generate", params);
export const getGallery = (page = 0, size = 12, sort = "recent") =>
  client.get(`/api/captions/gallery?page=${page}&size=${size}&sort=${sort}`);
export const likeCaption = (id) => client.post(`/api/captions/${id}/like`);
export const favoriteCaption = (id) => client.post(`/api/captions/${id}/favorite`);
export const unfavoriteCaption = (id) => client.delete(`/api/captions/${id}/favorite`);
export const getFavorites = () => client.get("/api/captions/favorites");

export const ocrGenerate = (formData) =>
  client.post("/api/ocr/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const ocrExtract = (formData) =>
  client.post("/api/ocr/extract", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
