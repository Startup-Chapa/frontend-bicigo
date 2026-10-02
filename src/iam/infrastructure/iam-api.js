import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { IamMockApi } from './iam-mock-api.js';

/**.
 * Set VITE_IAM_USE_MOCK=false in .env to talk to a real API.
 */
const USE_MOCK = import.meta.env?.VITE_IAM_USE_MOCK !== 'false';

export const IAM_ENDPOINTS = {
    signIn:         '/authentication/sign-in',         // POST { email, password }                              -> { token }
    signUp:         '/authentication/sign-up',         // POST { firstName, lastName, email, phone, password }  -> User resource
    forgotPassword: '/authentication/forgot-password', // POST { email }                                        -> 200 (always)
    resetPassword:  '/authentication/reset-password',  // POST { token, newPassword }                           -> 200 | 400
    user:           (userId) => `/users/${userId}`,                 // GET -> User resource | PUT { firstName, lastName, email, phone, currentPassword? } -> User resource
    userProfile:    (userId) => `/users/${userId}/profile`,         // PUT { documentType, documentNumber, photoUrl, emergencyContact } -> UserProfile resource
    changePassword: (userId) => `/users/${userId}/change-password`  // POST { currentPassword, newPassword } -> 204
};

class IamApi extends BaseApi {
    /** @param {string} email
     * @param {string} password
     */
    signIn(email, password) {
        return this.http.post(IAM_ENDPOINTS.signIn, { email, password });
    }

    /** @param {{firstName:string,lastName:string,email:string,phone:string,password:string}} data */
    signUp(data) {
        return this.http.post(IAM_ENDPOINTS.signUp, {
            firstName: data.firstName,
            lastName:  data.lastName,
            email:     data.email,
            phone:     data.phone,
            password:  data.password
        });
    }

    /** @param {string} email */
    requestPasswordReset(email) {
        return this.http.post(IAM_ENDPOINTS.forgotPassword, { email });
    }

    /** @param {string} token
     * @param {string} newPassword
     */
    resetPassword(token, newPassword) {
        return this.http.post(IAM_ENDPOINTS.resetPassword, { token, newPassword });
    }

    /** @param {string} userId */
    getUserById(userId) {
        return this.http.get(IAM_ENDPOINTS.user(userId));
    }

    /** @param {string} userId
     * @param {Object} data */
    updateUser(userId, data) {
        return this.http.put(IAM_ENDPOINTS.user(userId), data);
    }

    /** @param {string} userId
     * @param {Object} data
     */
    updateProfile(userId, data) {
        return this.http.put(IAM_ENDPOINTS.userProfile(userId), data);
    }

    /** @param {string} userId
     * @param {string} currentPassword
     * @param {string} newPassword */
    changePassword(userId, currentPassword, newPassword) {
        return this.http.post(IAM_ENDPOINTS.changePassword(userId), { currentPassword, newPassword });
    }
}

export const iamApi = USE_MOCK ? new IamMockApi() : new IamApi();