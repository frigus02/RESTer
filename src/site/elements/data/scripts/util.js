import { getEnvironment, settings } from './rester.js';
import { replace as replaceVariables } from './variables.js';

/**
 * Prepares an authorization provider config by replacing placeholders
 * with environment variables and adding the environment to the
 * `env` property of the config.
 *
 * This will happen, only if `enableVariables` in the config is set to
 * true.
 */
export async function prepareConfigWithEnvVariables(config) {
    if (config.enableVariables) {
        config = replaceVariables(config);

        const envId = settings.activeEnvironment;
        const env = await getEnvironment(envId, ['name']);
        config.env = env;
    }

    return config;
}
