import axios from "axios";
console.log("BASE URL:", import.meta.env.VITE_API_BASE_URL);
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});