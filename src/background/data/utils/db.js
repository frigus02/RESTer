import DataStore from './data-store.js';

const db = new DataStore([
    {
        name: 'authProviderConfigs'
    },
    {
        name: 'authTokens'
    },
    {
        name: 'environments'
    },
    {
        name: 'history'
    },
    {
        name: 'requests',
        indexes: ['collection']
    }
]);

export default db;
