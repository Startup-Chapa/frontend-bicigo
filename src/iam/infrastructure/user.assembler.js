import { User } from '../domain/model/user.entity.js'

/**
 * Maps user resources into domain entities.
 * Normalises both the GoldCheck format (username, segment lowercase)
 * and the OpalTrace format (firstName/lastName, segment uppercase, planTier).
 *
 * @class UserAssembler
 */
export class UserAssembler {
  /**
   * @param {Object} resource - User resource payload.
   * @returns {User} User entity.
   */
  static toEntityFromResource(resource) {
    const username = resource.username
      || [resource.firstName, resource.lastName].filter(Boolean).join(' ')
      || resource.companyName
      || resource.email

    const segment = (resource.segment || '').toLowerCase()
    const plan    = resource.plan || resource.planTier || 'BRONZE'

    return new User({
      id:          resource.id,
      email:       resource.email,
      username,
      phoneNumber: resource.phoneNumber || resource.phone_number || '',
      segment,
      plan,
      location:    resource.location || ''
    })
  }

  /**
   * Parses user resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with user resources.
   * @returns {User[]} User entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['users']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts a User entity into an API resource payload.
   *
   * @param {User} user - User entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(user) {
    return {
      email:       user.email,
      username:    user.username,
      phoneNumber: user.phoneNumber,
      segment:     user.segment,
      plan:        user.plan,
      location:    user.location
    }
  }
}