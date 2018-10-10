import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

const style = html`
    <style>
        app-toolbar {
            background-color: var(--primary-color);
        }

        [role="main"] {
            max-width: 1000px;
            margin: 0 auto;
            padding: 16px;
        }
    </style>
`;

export default style;
