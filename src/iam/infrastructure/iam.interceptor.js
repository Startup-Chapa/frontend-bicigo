import { iamStorage, TOKEN_KEY } from './iam-storage.js';

export function iamInterceptor(config) {
    const token = iamStorage.get(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}