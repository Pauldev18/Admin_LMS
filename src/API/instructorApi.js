import AxiosClient from "./AxiosClient";

export const fetchInstructors = () => AxiosClient.get('/api/instructors');
export const getInstructorById = (id) => AxiosClient.get(`/api/instructors/${id}`);
export const createInstructor = (data) => AxiosClient.post('/api/instructors', data);
export const updateInstructor = (id, data) => AxiosClient.put(`/api/instructors/${id}`, data);
export const deleteInstructor = (id) => AxiosClient.delete(`/api/instructors/${id}`);
export const fetchEligibleUsers = () => AxiosClient.get('/api/profile/eligible-users');