import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-selector/iron-selector.js';
import '../../../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/string_score/string_score.js';
import resterPaperItemButtonStyle from '../styles/rester-paper-item-button.js';

/**
 * @polymer
 * @customElement
 */
class RESTerAutocomplete extends PolymerElement {
    static get template() {
        return html`
            ${resterPaperItemButtonStyle}

            <style>
                :host {
                    --paper-item-body-two-line-min-height: 48px;
                    --paper-item-body-secondary: {
                        font-size: 12px;
                        line-height: 1em;
                    }
                }

                #dropdown {
                    position: absolute;
                    top: calc(100% + 2px);
                    left: 0;
                    right: 0;
                    z-index: 10;
                    overflow: auto;
                    padding: 0;
                    background-color: var(--light-theme-background-color);
                    color: var(--light-theme-text-color);

                    opacity: 0;
                    pointer-events: none;
                }

                #dropdown.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
            </style>

            <iron-selector
                id="dropdown"
                role="menu"
                class$="[[_getDropdownVisibilityClass(dropdownVisible)]]"
                style$="max-height: [[_getDropdownMaxHeight(dropdownItemsVisible, dropdownVisible)]]"
                tabindex="-1"
                selected="[[selectedIndex]]"
                selected-class="selected"
            >
                <template
                    is="dom-if"
                    if="[[_isActiveItemTemplate(itemTemplate, 'simple')]]"
                    restamp
                >
                    <template
                        is="dom-repeat"
                        items="[[items]]"
                        sort="_compareItems"
                    >
                        <paper-item
                            hidden$="[[!_isItemVisible(item, inputValue)]]"
                            class="button"
                            on-tap="_onItemClick"
                            tabindex="-1"
                        >
                            [[item]]
                        </paper-item>
                    </template>
                </template>
                <template
                    is="dom-if"
                    if="[[_isActiveItemTemplate(itemTemplate, 'two-line-score')]]"
                    restamp
                >
                    <template
                        is="dom-repeat"
                        items="[[items]]"
                        sort="_compareItems"
                        observe="score"
                        notify-dom-change
                        on-dom-change="_onDomForListChanged"
                    >
                        <paper-icon-item
                            hidden$="[[!_isItemVisible(item, inputValue)]]"
                            class="button"
                            on-tap="_onItemClick"
                            tabindex="-1"
                        >
                            <div slot="item-icon" class="score">
                                [[item.score]]
                            </div>
                            <paper-item-body two-line>
                                <div>[[item.title]]</div>
                                <div secondary>[[item.description]]</div>
                            </paper-item-body>
                        </paper-icon-item>
                    </template>
                </template>
            </iron-selector>
        `;
    }

    static get is() {
        return 'rester-autocomplete';
    }

    static get properties() {
        return {
            for: String,
            items: {
                type: Array,
                value: []
            },
            dropdownItemsVisible: {
                type: Number,
                value: 4.7
            },
            itemTemplate: {
                type: String,
                computed: '_computeItemTemplate(items)'
            },
            selectedIndex: {
                type: Number,
                readOnly: true,
                value: -1
            },
            dropdownVisible: {
                type: Boolean,
                value: false,
                readOnly: true
            },
            inputValue: {
                type: String,
                readOnly: true
            },
            sortByIndex: {
                type: Boolean,
                value: false
            }
        };
    }

    constructor() {
        super();
        this._input = undefined;
        this._inputFocused = false;

        this._onInputValueChanged = this._onInputValueChanged.bind(this);
        this._onInputClick = this._onInputClick.bind(this);
        this._onInputKeyDown = this._onInputKeyDown.bind(this);
        this._onInputFocus = this._onInputFocus.bind(this);
        this._onInputBlur = this._onInputBlur.bind(this);
    }

    ready() {
        super.ready();
        this._ensureAttribute('tabindex', -1);
    }

    connectedCallback() {
        super.connectedCallback();
        this._input = this.getRootNode().querySelector(`#${this.for}`);

        this._input.addEventListener('input', this._onInputValueChanged);
        this._input.addEventListener('click', this._onInputClick);
        this._input.addEventListener('keydown', this._onInputKeyDown);
        this._input.addEventListener('focus', this._onInputFocus);
        this._input.addEventListener('blur', this._onInputBlur);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._input.removeEventListener('input', this._onInputValueChanged);
        this._input.removeEventListener('click', this._onInputClick);
        this._input.removeEventListener('keydown', this._onInputKeyDown);
        this._input.removeEventListener('focus', this._onInputFocus);
        this._input.removeEventListener('blur', this._onInputBlur);
    }

    _computeItemTemplate() {
        const item = this.items && this.items[0];
        if (item) {
            if (
                item.hasOwnProperty('title') &&
                item.hasOwnProperty('description') &&
                item.hasOwnProperty('score')
            ) {
                return 'two-line-score';
            } else {
                return 'simple';
            }
        }
    }

    _getDropdownVisibilityClass(dropdownVisible) {
        return dropdownVisible ? 'visible' : '';
    }

    _getDropdownMaxHeight(dropdownItemsVisible, dropdownVisible) {
        const itemHeight = 48;
        const top = this.$.dropdown.getBoundingClientRect().top;

        const preferredHeight = itemHeight * dropdownItemsVisible;
        const minHeight = itemHeight * 1.5;
        const maxHeight =
            !dropdownVisible || top === 0 ? 0 : window.innerHeight - top;

        const height = Math.max(
            Math.min(preferredHeight, maxHeight),
            minHeight
        );

        return `${height}px`;
    }

    _isActiveItemTemplate(itemTemplate, templateName) {
        return itemTemplate === templateName;
    }

    _isItemVisible(item, value) {
        if (!item) {
            return false;
        }

        if (this.itemTemplate === 'two-line-score') {
            const index = this.items.indexOf(item);
            if (value) {
                const originalScore = Math.max(
                    item.title.score(value),
                    item.description.score(value)
                );
                this.set(
                    `items.${index}.score`,
                    Math.round(originalScore * 1000)
                );
            } else {
                this.set(`items.${index}.score`, 0);
            }

            return item.score > 0;
        } else {
            if (value) {
                return item.toLowerCase().includes(value.toLowerCase());
            } else {
                return true;
            }
        }
    }

    _compareItems(itemA, itemB) {
        if (this.sortByIndex) {
            return this.items.indexOf(itemA) - this.items.indexOf(itemB);
        }
        if (this.itemTemplate === 'two-line-score') {
            return itemB.score - itemA.score;
        } else {
            return itemA.localeCompare(itemB);
        }
    }

    _onInputValueChanged() {
        if (!this._ensureDropdownVisible()) {
            this._setInputValue(this._input.value);
        }

        if (this.itemTemplate === 'simple') {
            this._onDomForListChanged();
        }
    }

    _onDomForListChanged() {
        if (this.selectedIndex === -1) {
            this._moveSelectedIndexToNextItem();
        } else {
            const selectedItem = this._getItemByRenderedIndex(
                this.selectedIndex
            );
            if (
                selectedItem &&
                !this._isItemVisible(selectedItem, this.inputValue)
            ) {
                this._moveSelectedIndexToNextItem();
            }
        }
    }

    _onInputClick() {
        this._ensureDropdownVisible();
        this._setInputValue('');
    }

    _onInputKeyDown(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.stopPropagation();
                e.preventDefault();
                if (!this._ensureDropdownVisible()) {
                    this._moveSelectedIndexToNextItem();
                }

                break;
            case 'ArrowUp':
                e.stopPropagation();
                e.preventDefault();
                if (!this._ensureDropdownVisible()) {
                    this._moveSelectedIndexToPreviousItem();
                }

                break;
            case 'Tab':
                if (this.dropdownVisible && !e.shiftKey) {
                    const item = this._getItemByRenderedIndex(
                        this.selectedIndex
                    );
                    if (item && this._isItemVisible(item, this.inputValue)) {
                        this._selectItem(item);
                    }
                }

                break;
            case 'Enter':
                if (this.dropdownVisible) {
                    e.stopPropagation();
                    e.preventDefault();

                    const item = this._getItemByRenderedIndex(
                        this.selectedIndex
                    );
                    if (item && this._isItemVisible(item, this.inputValue)) {
                        this._selectItem(item);
                    }
                }

                break;
            case 'Escape':
                e.stopPropagation();
                e.preventDefault();
                this._setDropdownVisible(false);
                break;
        }
    }

    _onInputFocus() {
        this._inputFocused = true;
        this._ensureDropdownVisible(true);
    }

    _onInputBlur() {
        this._inputFocused = false;
        setTimeout(() => {
            const nextFocus = this.shadowRoot.activeElement;
            const isDropdownFocused =
                nextFocus &&
                nextFocus.closest('iron-selector') === this.$.dropdown;
            if (isDropdownFocused) {
                this._input.focus();
            } else if (!this._inputFocused) {
                this._setDropdownVisible(false);
            }
        }, 1);
    }

    _ensureDropdownVisible(resetSelectedIndex) {
        if (!this.dropdownVisible) {
            this._setInputValue(this._input.value);
            if (resetSelectedIndex) {
                this._setSelectedIndex(-1);
                this._moveSelectedIndexToNextItem();
            }

            this._setDropdownVisible(true);
            return true;
        } else {
            return false;
        }
    }

    _moveSelectedIndexToNextItem() {
        if (this.items.length === 0) {
            return;
        }

        const maxIndex = this.items.length - 1;
        let nextIndex = this.selectedIndex;
        do {
            nextIndex = Math.min(nextIndex + 1, maxIndex);
        } while (
            !this._isItemVisible(
                this._getItemByRenderedIndex(nextIndex),
                this.inputValue
            ) &&
            nextIndex < maxIndex
        );

        if (
            this._isItemVisible(
                this._getItemByRenderedIndex(nextIndex),
                this.inputValue
            )
        ) {
            this._setSelectedIndex(nextIndex);
            this._updateDrodownScroll(false);
        } else if (
            !this._isItemVisible(
                this._getItemByRenderedIndex(this.selectedIndex),
                this.inputValue
            )
        ) {
            this._moveSelectedIndexToPreviousItem();
        }
    }

    _moveSelectedIndexToPreviousItem() {
        if (this.items.length === 0) {
            return;
        }

        const minIndex = 0;
        let prevIndex = this.selectedIndex;
        do {
            prevIndex = Math.max(prevIndex - 1, minIndex);
        } while (
            !this._isItemVisible(
                this._getItemByRenderedIndex(prevIndex),
                this.inputValue
            ) &&
            prevIndex > minIndex
        );

        this._setSelectedIndex(prevIndex);
        this._updateDrodownScroll(true);
    }

    _updateDrodownScroll(alignTop) {
        if (this.selectedIndex === -1) {
            return;
        }

        const list = this.$.dropdown;
        const item = list.getElementsByClassName('button')[this.selectedIndex];
        if (!item) {
            return;
        }

        if (
            item.offsetTop >= list.scrollTop &&
            item.offsetTop + item.offsetHeight <=
                list.scrollTop + list.clientHeight
        ) {
            // Element is already in view. Nothing to do.
            return;
        }

        if (alignTop) {
            list.scrollTop = item.offsetTop;
        } else {
            list.scrollTop =
                item.offsetTop + item.offsetHeight - list.clientHeight;
        }
    }

    _getItemByRenderedIndex(index) {
        const domRepeat = this.$.dropdown.querySelector('dom-repeat');
        const itemElement = this.$.dropdown.getElementsByClassName('button')[
            index
        ];

        return itemElement && domRepeat.itemForElement(itemElement);
    }

    _onItemClick(e) {
        this._selectItem(e.model.item);
    }

    _selectItem(item) {
        const newValue =
            this.itemTemplate === 'two-line-score' ? item.title : item;

        if (this._input.parentElement.tagName === 'IRON-INPUT') {
            this._input.parentElement.bindValue = newValue;
        } else {
            this._input.value = newValue;
        }

        this._setDropdownVisible(false);
        this.dispatchEvent(
            new CustomEvent('item-selected', {
                detail: item,
                bubbles: true,
                composed: true
            })
        );
    }
}

customElements.define(RESTerAutocomplete.is, RESTerAutocomplete);
