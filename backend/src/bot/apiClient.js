import axios from 'axios';

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 5000,
});

export async function botRequest(path, options = {}) {
    const response = await api({
        url: path,
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            ...options.headers || {},
        },
        ...options,
    });
    return response;
}

export async function userRequest(path, token, options = {}) {
    const response = await api({
        url: path,
        headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers || {},
        },
        ...options,
    });
    return response;
}

export default api;