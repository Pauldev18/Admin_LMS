import AxiosClient from "./AxiosClient";

export const login = (email, password) =>
  AxiosClient.post("/api/auth/login", { email, password });
