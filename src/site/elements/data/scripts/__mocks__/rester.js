export const getEnvironment = jest.fn();
export const getHistoryEntries = jest.fn();
export const getRequests = jest.fn();
export const e = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};
export let settings = {};
export let settingsLoaded = Promise.resolve();

export function mockSettings(mock) {
    settings = mock;
}

export function mockSettingsLoaded(mock) {
    settingsLoaded = mock;
}
