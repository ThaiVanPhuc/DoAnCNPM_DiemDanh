import axios from "axios";

const httpRequest = axios.create({
  baseURL: "http://localhost:5000/api/",
  // baseURL: "/api/",
});

httpRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// GET
export const get = async (path) => {
  const response = await httpRequest.get(path);
  console.log(response);
  return response.data;
};

// POST
export const post = async (path, payload, headers) => {
  try {
    // const isFormData = payload instanceof FormData;
    const response = await httpRequest.post(path, payload, (headers = {}));
    return response.data;
  } catch (error) {
    return new Error(`Error: ${error}`);
  }
};

// PUT
export const put = async (path, payload) => {
  try {
    const response = await httpRequest.put(path, payload);
    return response.data;
  } catch (error) {
    return new Error(`Error: ${error}`);
  }
};

// DELETE
export const del = async (path) => {
  try {
    const response = await httpRequest.delete(path);
    return response.data;
  } catch (error) {
    return new Error(`Error: ${error}`);
  }
};

export const patch = async (path, payload) => {
  try {
    const response = await httpRequest.patch(path, payload);
    return response.data;
  } catch (error) {
    return new Error(`Error: ${error}`);
  }
};

export default httpRequest;
