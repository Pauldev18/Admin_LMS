import AxiosClient from "./AxiosClient";

export async function fetchPayments(params) {
  const res = await AxiosClient.get('/api/payment');
  return res.data;
}
