/**
 * @polymer
 * @mixinFunction
 *
 * Adds a function showError to the element, which can be used to display
 * an error in the default error dialog. Use it like follows:
 *
 * try {
 *     // Do sth, which can throw.
 * } catch (e) {
 *     this.showError(e);
 * }
 */
const RESTerErrorMixin = superclass => class extends superclass {
    showError(error, title) {
        const resterApp = document.querySelector('rester-app');
        const resterError = resterApp.shadowRoot.querySelector('rester-error');
        if (resterError) {
            resterError.show(error, title);
        }
    }
};

export default RESTerErrorMixin;
