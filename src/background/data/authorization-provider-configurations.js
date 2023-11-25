import db from './utils/db.js';

/**
 * @typedef AuthorizationProviderConfiguration
 * @type {Object}
 * @property {Number} id - Unique id of the provider config.
 * @property {String} title - Display name of the provider configuration.
 * @property {Number} providerId - The id of the token provider, this
 * configuration belongs to.
 */
export class AuthorizationProviderConfiguration {
    static get type() {
        return 'AuthorizationProviderConfiguration';
    }

    static get defaultProperties() {
        return {
            title: '',
            providerId: 0,
        };
    }

    constructor(dbObject) {
        Object.assign(
            this,
            AuthorizationProviderConfiguration.defaultProperties,
            dbObject,
        );
    }
}

export function putAuthorizationProviderConfiguration(config) {
    config = new AuthorizationProviderConfiguration(config);
    return db.transaction().put('authProviderConfigs', config).execute();
}

export async function queryAuthorizationProviderConfigurations(providerId) {
    const configs = await db.query(
        'authProviderConfigs',
        AuthorizationProviderConfiguration,
    );
    return configs.filter((config) => config.providerId === providerId);
}

export function deleteAuthorizationProviderConfiguration(id) {
    const config = new AuthorizationProviderConfiguration({ id });
    return db.transaction().delete('authProviderConfigs', config).execute();
}
