import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

const style = html`
    <style>
        input {
            position: relative;
            /* to make a stacking context */
            outline: none;
            box-shadow: none;
            padding: 0;
            width: 100%;
            max-width: 100%;
            background: transparent;
            border: none;
            color: var(
                --paper-input-container-input-color,
                var(--primary-text-color)
            );
            -webkit-appearance: none;
            text-align: inherit;
            vertical-align: bottom;

            /* Firefox sets a min-width on the input, which can cause layout issues */
            min-width: 0;
            @apply --paper-font-subhead;
            @apply --paper-input-container-input;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            @apply --paper-input-container-input-webkit-spinner;
        }

        input::-webkit-clear-button {
            @apply --paper-input-container-input-webkit-clear;
        }

        input::-webkit-input-placeholder {
            color: var(
                --paper-input-container-color,
                var(--secondary-text-color)
            );
        }

        input:-moz-placeholder {
            color: var(
                --paper-input-container-color,
                var(--secondary-text-color)
            );
        }

        input::-moz-placeholder {
            color: var(
                --paper-input-container-color,
                var(--secondary-text-color)
            );
        }

        input::-ms-clear {
            @apply --paper-input-container-ms-clear;
        }

        input:-ms-input-placeholder {
            color: var(
                --paper-input-container-color,
                var(--secondary-text-color)
            );
        }

        label {
            pointer-events: none;
        }
    </style>
`;

export default style;
