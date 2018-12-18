import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

const style = html`
    <style>
        paper-item.button,
        paper-icon-item.button {
            cursor: pointer;
        }

        paper-item.button::before,
        paper-icon-item.button::before {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: transparent;
            content: '';
            opacity: 0.24;
            pointer-events: none;
            transition: background-color 0.25s ease;
        }

        paper-item.button:hover::before,
        paper-icon-item.button:hover::before,
        paper-item.button.selected::before,
        paper-icon-item.button.selected::before {
            background-color: currentColor;
        }
    </style>
`;

export default style;
