import AxiosClient from "./AxiosClient";
export const fetchCategoryTree = async () => {
  const res = await AxiosClient.get('/api/categories/tree');
  return res.data;
};


export const createCategory = async (payload) => {
  const res = await AxiosClient.post('/api/categories', payload);
  return res.data;
};

export const updateCategory = async (id, payload) => {
  const res = await AxiosClient.put(`/api/categories/${id}`, payload);
  return res.data;
};

export const deleteCategory = (id) => {
  return AxiosClient.delete(`/api/categories/${id}`);
};