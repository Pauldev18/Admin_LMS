import AxiosClient from "./AxiosClient";

export const fetchUsers = async () => {
  try {
    const res = await AxiosClient.get('/api/users/allUser');
    return res;
  } catch (error) {
    throw error; // để component xử lý
  }
};

export const createUser = async (data) => {
  try {
    const res = await AxiosClient.post('/api/users', data);
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await AxiosClient.put(`/api/users/${id}`, data);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await AxiosClient.delete(`/api/users/${id}`);
    return res;
  } catch (error) {
    throw error;
  }
};
