import axios from "axios";
//Creating an Axios instance with the base URL to simplify requests
const myURL = "http://127.0.0.1:8000/api/";
//"http://127.0.0.1:8001/api/"
//"https://airgeadplanner.com/api/"
//"http://127.0.0.1:8000/api/"
const Axios = axios.create({
  baseURL: myURL,
  timeout: 5000,
  headers: {
    "Content-type": "application/json",
    accept: "application/json",
  },
});

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("Token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    else{
      config.headers.Authorization = ``;
    }
    return config;
  }
)

// Axios.js
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token
      localStorage.removeItem("Token");

      return Promise.reject({ ...error, redirectToLogin: true });
    }

    return Promise.reject(error);
  }
);


export default Axios;