import axios from 'axios';


const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 5000,
});
export async function botRequest(path, options = {}) {
    const requestConfig = {
        url: path,
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            ...options.headers || {},
        },
        ...options,
    };

    try {
        return await api(requestConfig);
    } catch (err) {
        const isConnRefused = err && (err.code === 'ECONNREFUSED' || (err.errors && err.errors.some && err.errors.some(e => e.code === 'ECONNREFUSED')));
        if (isConnRefused) {
            try {
                const fallbackBase = (process.env.API_URL || '').replace('localhost', '127.0.0.1');
                const fallback = axios.create({ baseURL: fallbackBase || 'http://127.0.0.1:4000/api', timeout: 5000 });
                console.warn('Connection refused to API_URL, retrying with', fallbackBase || 'http://127.0.0.1:4000/api');
                return await fallback(requestConfig);
            } catch (err2) {
                try {
                    err2.originalError = err;
                } catch (attachErr) {
                }
                throw err2;
            }
        }
        throw err;
    }
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