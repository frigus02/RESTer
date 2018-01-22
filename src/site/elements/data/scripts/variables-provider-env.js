import createEventTarget from './_create-event-target.js';
import {
    e as resterEvents,
    getEnvironment,
    settings,
    settingsLoaded
} from './rester.js';

const provider = {
    name: 'env',
    e: createEventTarget(),
    values: {}
};

function updateValues() {
    let envId = settings.activeEnvironment;
    if (envId) {
        getEnvironment(envId).then(env => {
            provider.values = env ? env.values : {};
            provider.e.fireEvent('valuesChanged', provider.values);
        });
    } else {
        provider.values = {};
        provider.e.fireEvent('valuesChanged', provider.values);
    }
}

settingsLoaded.then(updateValues);
resterEvents.addEventListener('dataChange', updateValues);
resterEvents.addEventListener('settingsChange', updateValues);

export default provider;
