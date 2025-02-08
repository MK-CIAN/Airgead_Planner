import axios from "axios";

//Creating an Axios instance with the base URL to simplify requests
const myURL = "http://127.0.0.1:8001/";

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

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("Token");
    }
    return Promise.reject(error);
  }
)

export default Axios;