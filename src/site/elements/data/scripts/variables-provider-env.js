import CustomEventTarget from '../../../../shared/custom-event-target.js';
import {
    e as resterEvents,
    getEnvironment,
    settings,
    settingsLoaded,
} from './rester.js';

const provider = {
    name: 'env',
    e: new CustomEventTarget(),
    values: {},
};

function updateValues() {
    let envId = settings.activeEnvironment;
    if (envId) {
        getEnvironment(envId).then((env) => {
            provider.values = env ? env.values : {};
            provider.e.dispatchEvent(
                new CustomEvent('valuesChanged', {
                    detail: provider.values,
                })
            );
        });
    } else {
        provider.values = {};
        provider.e.dispatchEvent(
            new CustomEvent('valuesChanged', {
                detail: provider.values,
            })
        );
    }
}

settingsLoaded.then(updateValues);
resterEvents.addEventListener('dataChange', updateValues);
resterEvents.addEventListener('settingsChange', updateValues);

export default provider;
