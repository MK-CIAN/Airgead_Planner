import axios from "axios";
//Creating an Axios instance with the base URL to simplify requests
const myURL = "https://airgeadplanner.com/api/";

// Prod and Dev URLs
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

// Not attaching token for login or register
Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("Token");

  // Don't attach token for login or register
  const isAuthEndpoint = config.url?.includes("login") || config.url?.includes("register");

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});


// Handle expired tokens
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Clear the invalid token
      localStorage.removeItem("Token");

      // If it's the login endpoint itself, don't retry — just let the AuthPage handle the error
      if (originalRequest.url.includes("login")) {
        return Promise.reject(error);
      }

      // Otherwise, mark for redirect and let the app handle routing cleanly
      return Promise.reject({ ...error, isExpiredToken: true });
    }

    return Promise.reject(error);
  }
);

export default Axios;