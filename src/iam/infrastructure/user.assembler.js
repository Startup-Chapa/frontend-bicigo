import { User, UserStatus } from '../domain/model/user.entity.js';

export class UserAssembler {
    /**
     * @param {Object} resource - User resource payload.
     * @returns {User}
     */
    static toEntityFromResource(resource) {
        return new User({
            id:        resource.userId ?? resource.id ?? null,
            firstName: resource.firstName ?? '',
            lastName:  resource.lastName ?? '',
            email:     resource.email ?? '',
            phone:     resource.phone ?? resource.phoneNumber ?? '',
            status:    resource.status ?? UserStatus.ACTIVE,
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data['users'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
    /**
     * @param {User} user
     * @returns {Object} User resource payload.
     */
    static toResourceFromEntity(user) {
        return {
            userId:    user.id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            phone:     user.phone,
            status:    user.status,
        };
    }
}