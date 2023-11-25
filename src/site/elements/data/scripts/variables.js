import CustomEventTarget from '../../../../shared/custom-event-target.js';
import { clone } from '../../../../shared/util.js';
import providerEnv from './variables-provider-env.js';

export const e = new CustomEventTarget();
export const providedValues = {};

export const RE_PATTERN_VAR = '[\\w$-]+(\\.[\\w$-]+)*';
const RE_VARS = new RegExp('\\{(' + RE_PATTERN_VAR + ')\\}', 'g');
const providers = [providerEnv];

collectProvidedValues();
initVarProviderChangeListeners();

function collectProvidedValues() {
    for (const prop in providedValues) {
        if (Object.prototype.hasOwnProperty.call(providedValues, prop)) {
            delete providedValues[prop];
        }
    }

    for (const provider of providers) {
        for (const key in provider.values) {
            if (Object.prototype.hasOwnProperty.call(provider.values, key)) {
                providedValues[`$${provider.name}.${key}`] =
                    provider.values[key];
            }
        }
    }

    e.dispatchEvent(
        new CustomEvent('providedValuesChanged', {
            detail: providedValues,
        }),
    );
}

function initVarProviderChangeListeners() {
    for (const provider of providers) {
        provider.e.addEventListener('valuesChanged', collectProvidedValues);
    }
}

export function extract(obj) {
    const vars = new Set();

    if (typeof obj === 'string') {
        const matches = obj.match(RE_VARS);
        if (matches) {
            matches
                .map((m) => m.substr(1, m.length - 2))
                .forEach((v) => vars.add(v));
        }
    } else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            extract(obj[key]).forEach((v) => vars.add(v));
        }
    }

    return Array.from(vars);
}

function replaceInternal(obj, values, usedValues, mapValue) {
    if (typeof obj === 'string') {
        obj = obj.replace(RE_VARS, (match) => {
            const varName = match.substr(1, match.length - 2);
            const value = values[varName];

            if (value) {
                usedValues[varName] = value;
                return mapValue(value);
            } else {
                return `{${varName}}`;
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        obj = clone(obj);
        for (const key of Object.keys(obj)) {
            obj[key] = replaceInternal(obj[key], values, usedValues, mapValue);
        }
    }

    return obj;
}

export function replace(
    obj,
    values = {},
    usedValues = {},
    mapValue = (x) => x,
) {
    return replaceInternal(
        obj,
        Object.assign({}, values, providedValues),
        usedValues,
        mapValue,
    );
}

export function replaceWithoutProvidedValues(
    obj,
    values = {},
    usedValues = {},
    mapValue = (x) => x,
) {
    return replaceInternal(
        obj,
        Object.assign({}, values),
        usedValues,
        mapValue,
    );
}
