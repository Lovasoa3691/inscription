import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api', withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                await api.post('/refresh-token');
                return api.request(error.config);
            } catch (error) {
                alert("Session expiree, redirection vers la page de connexion");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
)

export default api;