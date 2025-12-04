import axios from "axios";

// URL para desarrollo local - CORREGIDO
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.66:3000/api/dsm44";

export const EmpleadosApi = axios.create({
    baseURL: API_URL,
    timeout: 15000, // Aumentado timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para manejar errores - MEJORADO
EmpleadosApi.interceptors.request.use(
    (config) => {
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

EmpleadosApi.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`❌ Error ${error.response.status}:`, {
                url: error.config.url,
                data: error.response.data,
                message: error.response.data?.message || 'Error del servidor'
            });
        } else if (error.request) {
            console.error('❌ Error de red:', error.request);
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);