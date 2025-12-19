import axios from "./api";

export const getAllShifts = async () => {
  const res = await axios.get("/api/shifts");
  return res.data;
};

export const createShift = async (data) => {
  const res = await axios.post("/api/shifts", data);
  return res.data;
};

export const updateShift = async (id, data) => {
  const res = await axios.put(`/api/shifts/${id}`, data);
  return res.data;
};

export const deleteShift = async (id) => {
  const res = await axios.delete(`/api/shifts/${id}`);
  return res.data;
};
