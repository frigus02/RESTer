import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import { duration as formatDuration } from '../data/scripts/format.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin RESTerDialogControllerMixin
 */
class RESTerTimingDurationDialog extends RESTerDialogControllerMixin(
    PolymerElement
) {
    static get template() {
        return html`
            <style>
                dom-repeat {
                    display: none;
                }

                .timeline {
                    width: 200px;
                }

                .timeline-bar {
                    background-color: var(--primary-color);
                    height: 0.7em;
                    min-width: 1px;
                }

                @media (max-width: 600px) {
                    .timeline {
                        display: none;
                    }
                }

                .value {
                    text-align: right;
                }

                tfoot .value {
                    font-weight: bold;
                }
            </style>

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop
                    restore-focus-on-close>
                <paper-dialog-scrollable>
                    <div hidden$="[[dataAvailable]]">No data available.</div>
                    <table hidden$="[[!dataAvailable]]">
                        <tbody>
                            <template is="dom-repeat" items="[[timeline]]">
                                <tr>
                                    <td class="label">[[item.label]]</td>
                                    <td class="timeline">
                                        <div class="timeline-bar" style$="width: [[_calcPercentage(data.duration, item.duration)]]%; margin-left: [[_calcPercentage(data.duration, item.startAt)]]%;"></div>
                                    </td>
                                    <td class="value">[[_formatDuration(item.duration)]]</td>
                                </tr>
                            </template>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td class="label"></td>
                                <td class="timeline"></td>
                                <td class="value">[[_formatDuration(data.duration)]]</td>
                            </tr>
                        </tfoot>
                    </table>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss autofocus>OK</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-timing-duration-dialog';
    }

    static get properties() {
        return {
            data: String,
            dataAvailable: {
                type: Boolean,
                value: false,
                computed: '_computeDataAvailable(data)'
            },
            timeline: {
                type: Array,
                value: [],
                computed: '_computeTimeline(data)'
            }
        };
    }

    static get resterDialogId() {
        return 'timingDuration';
    }

    _computeDataAvailable(data) {
        return !!data;
    }

    _computeTimeline(data) {
        if (!data) {
            return [];
        }

        const queueRequest = {
            label: 'Queue request',
            startAt: 0,
            duration: data.domainLookupStart - data.fetchStart
        };

        const lookupDns = {
            label: 'Lookup DNS',
            startAt: data.domainLookupStart - data.fetchStart,
            duration: data.domainLookupEnd - data.domainLookupStart
        };

        // Missing: domainLookupEnd to connectStart

        const connect = {
            label: 'Connect',
            startAt: data.connectStart - data.fetchStart,
            duration: data.connectEnd - data.connectStart
        };

        // Missing: connectEnd to requestStart

        const sendRequest = {
            label: 'Send request + wait (TTFB)',
            startAt: data.requestStart - data.fetchStart,
            duration: data.responseStart - data.requestStart
        };

        const downloadResponse = {
            label: 'Download response',
            startAt: data.responseStart - data.fetchStart,
            duration: data.responseEnd - data.responseStart
        };

        return [
            queueRequest,
            lookupDns,
            connect,
            sendRequest,
            downloadResponse
        ];
    }

    _calcPercentage(full, fraction) {
        return (fraction / full) * 100;
    }

    _formatDuration(duration) {
        if (duration !== undefined) {
            return formatDuration(duration, 2);
        }
    }
}

customElements.define(
    RESTerTimingDurationDialog.is,
    RESTerTimingDurationDialog
);
