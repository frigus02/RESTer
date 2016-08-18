'use strict';

const { emit } = require('sdk/event/core'),
      { EventTarget } = require("sdk/event/target");


exports.target = EventTarget();

exports.fireChangeEvent = function (changes) {
    emit(exports.target, 'change', changes);
};
