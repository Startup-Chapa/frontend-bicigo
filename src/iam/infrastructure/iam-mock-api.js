/**
 * Demo accounts:
 *   demo@bicigo.com       / BiciGo123   -> ACTIVE
 *   suspended@bicigo.com  / BiciGo123   -> SUSPENDED
 */
const USERS_KEY  = 'bicigo_mock_users';
const RESETS_KEY = 'bicigo_mock_reset_tokens';
const LATENCY_MS = 350;

const delay = (ms = LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms));
const respond = (data, status = 200) => ({ status, data });

function fail(status, code) {
    const error = new Error(code || `HTTP ${status}`);
    error.response = { status, data: { code } };
    return error;
}

function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function uuid() {
    return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function base64Url(obj) {
    return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(user) {
    const header  = { alg: 'none', typ: 'JWT' };
    const payload = { sub: user.userId, email: user.email, role: 'USER', exp: Math.floor(Date.now() / 1000) + 3600 };
    return `${base64Url(header)}.${base64Url(payload)}.mock-signature`;
}

function publicUser({ password, ...rest }) {
    return rest;
}

function seedUsers() {
    const users = load(USERS_KEY, null);
    if (users) return users;
    const seeded = [
        { userId: uuid(), firstName: 'Demo', lastName: 'BiciGo', email: 'demo@bicigo.com', phone: '987654321',
            status: 'ACTIVE', password: 'BiciGo123' },
        { userId: uuid(), firstName: 'Cuenta', lastName: 'Suspendida', email: 'suspended@bicigo.com', phone: '',
            status: 'SUSPENDED', password: 'BiciGo123' }
    ];
    save(USERS_KEY, seeded);
    return seeded;
}

const normalize = (email) => String(email || '').trim().toLowerCase();

export class IamMockApi {
    async signIn(email, password) {
        await delay();
        const user = seedUsers().find(u => normalize(u.email) === normalize(email));
        if (!user || user.password !== password) throw fail(401, 'INVALID_CREDENTIALS');
        if (user.status === 'SUSPENDED') throw fail(403, 'ACCOUNT_SUSPENDED');
        return respond({ token: createToken(user) });
    }

    async signUp(data) {
        await delay();
        const users = seedUsers();
        if (users.some(u => normalize(u.email) === normalize(data.email))) throw fail(409, 'EMAIL_TAKEN');
        const user = {
            userId: uuid(), firstName: data.firstName, lastName: data.lastName,
            email: data.email.trim(), phone: data.phone || '', status: 'ACTIVE',
            password: data.password
        };
        save(USERS_KEY, [...users, user]);
        return respond(publicUser(user), 201);
    }

    async requestPasswordReset(email) {
        await delay();
        const user = seedUsers().find(u => normalize(u.email) === normalize(email));
        if (user) {
            const token = uuid();
            const resets = load(RESETS_KEY, []);
            save(RESETS_KEY, [...resets, { token, userId: user.userId, expiresAt: Date.now() + 30 * 60 * 1000 }]);
            // There is no email service: the link is printed to the console instead.
            console.info(`[BiciGo mock] Password reset link: ${globalThis.location?.origin ?? ''}/auth/reset?token=${token}`);
        }
        return respond({}); // Always 200: do not reveal whether the email exists.
    }

    async resetPassword(token, newPassword) {
        await delay();
        const resets = load(RESETS_KEY, []);
        const entry = resets.find(r => r.token === token && r.expiresAt > Date.now());
        if (!entry) throw fail(400, 'INVALID_RESET_TOKEN');
        const users = seedUsers().map(u => u.userId === entry.userId ? { ...u, password: newPassword } : u);
        save(USERS_KEY, users);
        save(RESETS_KEY, resets.filter(r => r.token !== token));
        return respond({});
    }

    async getUserById(userId) {
        await delay(150);
        const user = seedUsers().find(u => u.userId === userId);
        if (!user) throw fail(404, 'USER_NOT_FOUND');
        return respond(publicUser(user));
    }

    async updateUser(userId, data) {
        await delay();
        const users = seedUsers();
        const current = users.find(u => u.userId === userId);
        if (!current) throw fail(404, 'USER_NOT_FOUND');

        const emailChanged = normalize(data.email) !== normalize(current.email);
        if (emailChanged) {
            if (current.password !== data.currentPassword) throw fail(400, 'INVALID_CURRENT_PASSWORD');
            if (users.some(u => u.userId !== userId && normalize(u.email) === normalize(data.email))) throw fail(409, 'EMAIL_TAKEN');
        }
        const updated = {
            ...current,
            firstName: data.firstName, lastName: data.lastName,
            email: data.email.trim(), phone: data.phone || ''
        };
        save(USERS_KEY, users.map(u => u.userId === userId ? updated : u));
        return respond(publicUser(updated));
    }

    async changePassword(userId, currentPassword, newPassword) {
        await delay();
        const users = seedUsers();
        const current = users.find(u => u.userId === userId);
        if (!current) throw fail(404, 'USER_NOT_FOUND');
        if (current.password !== currentPassword) throw fail(400, 'INVALID_CURRENT_PASSWORD');
        save(USERS_KEY, users.map(u => u.userId === userId ? { ...u, password: newPassword } : u));
        return respond({}, 204);
    }
}