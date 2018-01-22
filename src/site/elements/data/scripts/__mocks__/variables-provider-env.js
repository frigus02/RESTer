import createEventTarget from '../_create-event-target.js';

const provider = {
    name: 'env',
    e: createEventTarget(),
    values: {}
};

export default provider;
