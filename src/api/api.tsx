import axios, { InternalAxiosRequestConfig  } from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_ENV === 'production'
        ? process.env.REACT_APP_API_URL_SERVER
        : process.env.REACT_APP_API_URL_LOCAL,
    withCredentials: true, // Asegura el envío de cookies
});

// Interceptor para incluir automáticamente el token en todas las solicitudes
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig ) => {
        const token = localStorage.getItem('accessToken'); // O sessionStorage.getItem('token');
        
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`; // Incluir el token en el encabezado
        }

        return config;
    },
    (error) => {
        return Promise.reject(error); // Manejar el error
    }
);

export default api;
