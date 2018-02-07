import { settings } from '../data/scripts/rester.js';
import { debounce } from '../../../shared/util.js';
import { replace as replaceVariables } from '../data/scripts/variables.js';

/**
 * @polymer
 * @mixinFunction
 *
 * Allows to register lint inspections, which can be used to inspect
 * the current properties and show warnings, when they don't comply
 * to the rules.
 *
 * Define inspections like this:
 *
 * static get resterLintInspections() {
 *     return [
 *         {
 *             message: 'You are doing it wrong. :-)',
 *             check: '_lintYouAreDoingItWrong',
 *             fixLabel: 'Help me!',
 *             fix: '_fixYouAreDoingItWrong'
 *         }
 *     ];
 * }
 *
 * Then run inspections, when the observed properties change by setting
 * up an observer:
 *
 * observers: [
 *     '_runLintInspections(YOUR_OBSERVED_PROPERTIES_HERE)'
 * ]
 */
const RESTerLintMixin = superclass => class extends superclass {
    constructor() {
        super();
        this._runLintInspectionsImmediately = this._runLintInspectionsImmediately.bind(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const inspections = this.constructor.resterLintInspections || [];
        const messages = this.root.querySelector('rester-lint-messages');

        if (!messages) {
            return;
        }

        inspections.forEach(inspection => {
            messages.removeMessage(inspection.check);
        });
    }

    _runLintInspections() {
        if (!settings.enableRequestLintInspections) {
            return;
        }

        debounce(this._runLintInspectionsImmediately, 300);
    }

    _runLintInspectionsImmediately() {
        const inspections = this.constructor.resterLintInspections || [];
        const messages = this.root.querySelector('rester-lint-messages');

        if (!messages) {
            return;
        }

        inspections.forEach(inspection => {
            const result = this[inspection.check].call(this);
            if (result) {
                messages.putMessage(inspection.check, {
                    message: replaceVariables(inspection.message, result),
                    fixLabel: replaceVariables(inspection.fixLabel, result),
                    fix: this[inspection.fix].bind(this)
                });
            } else {
                messages.removeMessage(inspection.check);
            }
        });
    }
};

export default RESTerLintMixin;
