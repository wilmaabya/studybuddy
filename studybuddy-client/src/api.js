import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

export function setAuthToken(token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
