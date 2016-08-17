'use strict';

const { emit } = require('sdk/event/core'),
      { EventTarget } = require("sdk/event/target");


exports.target = EventTarget();

exports.wrapFireChangeListenersForThen = function (action, item) {
    const changes = [{
        action,
        item,
        itemType: item.constructor.name
    }];

    return function () {
        emit(exports.target, 'change', changes);
    };
};
