export const TOKEN_KEY = 'bicigo_token';
export const USER_KEY  = 'bicigo_user';

export const iamStorage = {
    /** @param {string} key @returns {?string} */
    get(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    /** @param {string} key @param {string} value
     * @param value
     */
    set(key, value) {
        try { localStorage.setItem(key, value); } catch {}
    },
    /** @param {string} key */
    remove(key) {
        try { localStorage.removeItem(key); } catch {}
    }
};