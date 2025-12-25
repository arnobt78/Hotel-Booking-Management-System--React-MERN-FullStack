import axios, { InternalAxiosRequestConfig } from "axios";

// Pomoćna funkcija za bazu URL-a
const getBaseURL = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7002";
  }
  return "/";
};

// Proširujemo Axios konfiguraciju da bismo pratili retry pokušaje
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // KLJUČNO: Omogućava browseru da automatski šalje HttpOnly kolačiće
  headers: {
    "Content-Type": "application/json",
  },
});

// RESPONSE INTERCEPTOR: Hendla 401 grešku (istekao Access Token)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Ako je greška 401 (Unauthorized) i nismo već probali refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Pozivamo backend rutu za osvježavanje tokena
        // Koristimo običan 'axios' da ne bismo ponovo okinuli ovaj isti interceptor
        await axios.post(
          `${getBaseURL()}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Ako refresh prođe, ponavljamo originalni zahtjev koji je prvobitno pao
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Ako i refresh padne (npr. i refresh_token je istekao), izloguj korisnika
        console.error("Session expired, please login again.");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;