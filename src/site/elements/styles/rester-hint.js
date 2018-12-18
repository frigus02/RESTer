import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

const style = html`
    <style>
        .hint {
            font-size: 12px;
            line-height: 14px;
            color: var(--secondary-text-color);
        }

        paper-input[hidden] + .hint {
            display: none;
        }
    </style>
`;

export default style;
