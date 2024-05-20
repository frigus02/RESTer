import CustomEventTarget from '../../../../../shared/custom-event-target.js';

const provider = {
    name: 'env',
    e: new CustomEventTarget(),
    values: {},
};

export default provider;
