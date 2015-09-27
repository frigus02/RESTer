'use strict';

// monkeypatch Mousetrap's stopCallback() function
// this version doesn't return true when the element is an INPUT, SELECT, or TEXTAREA
Mousetrap.prototype.stopCallback = function(event, element, combo) {
    if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false;
    }

    return element.contentEditable && element.contentEditable == 'true';
};

angular.module('app')
    .service('$hotkeys', ['$window', '$rootScope', '$mdDialog', function ($window, $rootScope, $mdDialog) {
        var self = this,
            hotkeys = [];

        /**
         * @typedef $hotkeys~Hotkey
         * @type {Object}
         * @param {Array<String>} combos - The mousetrap key bindings.
         * @param {String} description - A description for the cheat sheet.
         * @param {Function} callback - A method to call when key is pressed.
         * @param {Boolean} allowInFormControls - A boolean indicating of the
         * combos are allowed inside of INPUT, SELECT and TEXTAREA elements. Default
         * is false.
         */
        self.Hotkey = function (props) {
            this.combos = props.combos || [];
            this.description = props.description || '';
            this.callback = props.callback;
            this.allowInFormControls = !!props.allowInFormControls;
        }

        self.Hotkey.prototype.getFormattedCombos = function () {
            var map = {
                command   : '\u2318',  // ⌘
                shift     : '\u21E7',  // ⇧
                left      : '\u2190',  // ←
                right     : '\u2192',  // →
                up        : '\u2191',  // ↑
                down      : '\u2193',  // ↓
                'return'  : '\u23CE',  // ⏎
                backspace : '\u232B'   // ⌫
            };

            return this.combos.map(binding => {
                return binding.split('+')
                    .map(key => {
                        if (key === 'mod') {
                            if ($window.navigator && $window.navigator.platform.indexOf('Mac') >=0 ) {
                                key = 'command';
                            } else {
                                key = 'ctrl';
                            }
                        }

                        return map[key] || key;
                    })
                    .join(' + ');
            });
        };

        /**
         * Binds a new hotkey.
         *
         * @param {$hotkeys~Hotkey} hotkey - The hotkey.
         * @param {Scope} An optional angular scope. When this scope is destroyed,
         * the hotkey is removed.
         */
        self.add = function (hotkey, scope) {
            Mousetrap.bind(hotkey.combos, function(event) {
                event.preventDefault();

                var nodeName = event.target.nodeName.toUpperCase();
                if (hotkey.allowInFormControls || (nodeName !== 'INPUT' && nodeName !== 'SELECT' && nodeName !== 'TEXTAREA')) {
                    $rootScope.$applyAsync(function () {
                        hotkey.callback();
                    });
                }
            });

            if (scope) {
                scope.$on('$destroy', function () {
                    self.remove(hotkey);
                });
            }

            hotkeys.push(hotkey);
        };

        /**
         * Gets all currently active hotkeys.
         *
         * @returns {Array<$hotkeys~Hotkey>} An array of hotkeys.
         */
        self.getAll = function () {
            return hotkeys;
        };

        /**
         * Unbinds the specified hotkey.
         *
         * @param {String} combo - The combo to unbind.
         */
        self.remove = function (hotkey) {
            Mousetrap.unbind(hotkey.combos);

            var index = hotkeys.indexOf(hotkey);
            if (index > -1) {
                hotkeys.splice(index, 1);
            }
        };

        self.showCheatSheet = function (targetEvent) {
            $mdDialog.show({
                targetEvent: targetEvent,
                templateUrl: 'views/dialogs/hotkey-cheat-sheet.html',
                controller: 'DialogHotkeyCheatSheetCtrl',
                clickOutsideToClose: true,
                escapeToClose: true
            });
        };

        self.add(new self.Hotkey({
            combos: ['?'],
            description: 'Shows this cheat sheet.',
            callback: self.showCheatSheet
        }), $rootScope);

    }]);
