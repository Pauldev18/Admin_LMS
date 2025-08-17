import AxiosClient from "./AxiosClient";

export const getLevels = () => AxiosClient.get("/api/levels");                 // GET all
export const getLevelById = (id) => AxiosClient.get(`/api/levels/${id}`);      // GET one
export const createLevel = (data) => AxiosClient.post("/api/levels", data);    // POST
export const updateLevel = (id, data) => AxiosClient.put(`/api/levels/${id}`, data); // PUT
export const deleteLevel = (id) => AxiosClient.delete(`/api/levels/${id}`);    // DELETE
