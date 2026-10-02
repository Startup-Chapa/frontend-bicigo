import { User, UserStatus } from '../domain/model/user.entity.js';
import { UserProfile } from '../domain/model/user-profile.entity.js';

export class UserAssembler {
    /**
     * @param {?Object} resource - UserProfile resource payload.
     * @returns {?UserProfile}
     */
    static toProfileFromResource(resource) {
        if (!resource) return null;
        return new UserProfile({
            id:               resource.profileId ?? resource.id ?? null,
            userId:           resource.userId ?? '',
            documentType:     resource.documentType ?? '',
            documentNumber:   resource.documentNumber ?? '',
            photoUrl:         resource.photoUrl ?? '',
            emergencyContact: resource.emergencyContact ?? ''
        });
    }

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
            profile:   this.toProfileFromResource(resource.profile)
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
     * @param {UserProfile} profile
     * @returns {Object} UserProfile resource payload.
     */
    static toProfileResourceFromEntity(profile) {
        return {
            profileId:        profile.id,
            userId:           profile.userId,
            documentType:     profile.documentType,
            documentNumber:   profile.documentNumber,
            photoUrl:         profile.photoUrl,
            emergencyContact: profile.emergencyContact
        };
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
            profile:   user.profile ? this.toProfileResourceFromEntity(user.profile) : null
        };
    }
}