import axios, { AxiosInstance } from 'axios';
import { baseURL } from '../utils/Parameters'; // Importa tu baseURL exportable

// Extiende el tipo AxiosInstance
interface CustomAxiosInstance extends AxiosInstance {
    isAxiosError?: typeof axios.isAxiosError;
  }

const axiosInstance: CustomAxiosInstance = axios.create({
    baseURL, // Usa la baseURL configurada dinámicamente
    withCredentials: true, // Permite enviar cookies si es necesario
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token'); // O la forma en que almacenas el token
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Agrega la utilidad `isAxiosError` a la instancia
axiosInstance.isAxiosError = axios.isAxiosError;

export default axiosInstance;