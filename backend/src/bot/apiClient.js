import axios from 'axios';
import { logger } from '../config/logger.js';

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 15000,
});

export async function botRequest(path, options = {}) {
    const requestConfig = {
        url: path,
        headers: {
            Authorization: `Bearer ${process.env.BOT_API_KEY}`,
            ...options.headers || {},
        },
        ...options,
    };

    try {
        return await api(requestConfig);
    } catch (err) {
        logger.warn({ url: process.env.API_URL, code: err.code }, 'Erro ao chamar API');
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

export async function userRequestWithRefresh(path, session, options = {}) {
    const makeRequest = (t) => api({
        url: path,
        headers: { Authorization: `Bearer ${t}`, ...options.headers || {} },
        ...options,
    });

    try {
        return await makeRequest(session.token);
    } catch (err) {
        if (err.response?.status !== 401 || !session.refreshToken) throw err;

        try {
            const { data } = await api.post('/auth/refresh', { refreshToken: session.refreshToken });
            session.token = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await makeRequest(session.token);
        } catch (refreshErr) {
            logger.warn({ err: refreshErr.message }, 'Falha ao renovar token no bot');
            throw err;
        }
    }
}

export default api;
