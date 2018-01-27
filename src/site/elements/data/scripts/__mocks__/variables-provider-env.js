/* eslint-env node, jest */

import CustomEventTarget from '../custom-event-target.js';

const provider = {
    name: 'env',
    e: new CustomEventTarget(),
    values: {}
};

export default provider;
