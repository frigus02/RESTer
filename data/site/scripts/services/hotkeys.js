'use strict';

// Monkeypatch Mousetrap's stopCallback() function, so it  doesn't return true
// when the element is an INPUT, SELECT, or TEXTAREA.
Mousetrap.prototype.stopCallback = function (event, element/*, combo*/) {
    if (element.classList.contains('mousetrap')) {
        return false;
    }

    return element.contentEditable && element.contentEditable === 'true';
};

angular.module('app')
    .service('$hotkeys', ['$window', '$rootScope', '$mdDialog', function ($window, $rootScope, $mdDialog) {
        let self = this,
            hotkeys = [],
            safeKeysForFormControls = ['ctrl', 'alt', 'meta', 'command', 'option', 'mod'];

        /**
         * @typedef $hotkeys~Hotkey
         * @type {Object}
         * @param {Array<String>} combos - The mousetrap key bindings.
         * @param {String} description - A description for the cheat sheet.
         * @param {Function} callback - A method to call when key is pressed.
         */
        self.Hotkey = function (props) {
            this.combos = props.combos || [];
            this.description = props.description || '';
            this.callback = props.callback;
        };

        self.Hotkey.prototype.getFormattedCombos = function () {
            let map = {
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
                            if ($window.navigator && $window.navigator.platform.indexOf('Mac') >= 0) {
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
            Mousetrap.bind(hotkey.combos, function (event, combo) {
                let handleEvent = true,
                    nodeName = event.target.nodeName.toUpperCase(),
                    pressedKeys = combo.split(/[ +]/);

                if (nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA') {
                    handleEvent = pressedKeys.some(key => safeKeysForFormControls.indexOf(key) > -1);
                }

                if (handleEvent) {
                    event.preventDefault();
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

            let index = hotkeys.indexOf(hotkey);
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
