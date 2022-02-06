/* global module:false define:false */

/**
 * JSON formatting (pretty printing), which does not modify the JSON in any other way than normalizing whitespace.
 */
(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.resterFormatJson = factory();
    }
})(this, function () {
    const S = (function () {
        let s = 0;
        return {
            VALUE: s++,
            STRING: s++,
            STRING_SLASHED: s++,
            STRING_SLASHED_U_1: s++,
            STRING_SLASHED_U_2: s++,
            STRING_SLASHED_U_3: s++,
            STRING_SLASHED_U_4: s++,
            NUMBER: s++,
            OBJECT: s++,
            OBJECT_KEY: s++,
            OBJECT_VALUE: s++,
            OBJECT_VALUE_END: s++,
            ARRAY: s++,
            ARRAY_VALUE_END: s++,
            TRUE_1: s++,
            TRUE_2: s++,
            TRUE_3: s++,
            FALSE_1: s++,
            FALSE_2: s++,
            FALSE_3: s++,
            FALSE_4: s++,
            NULL_1: s++,
            NULL_2: s++,
            NULL_3: s++,
            NAN_1: s++,
            NAN_2: s++,
            END: s++,
        };
    })();
    const INDENT_SIZE = 4;
    const MAX_DEPTH = 500;
    const NUMBER_START_CHARS = new Set('-0123456789');
    const NUMBER_CHARS = new Set('-+0123456789.eE');
    const STRING_ESCAPED_CHARS = new Set('"\\/bfnrt');
    const WHITESPACE_CHARS = new Set('\r\n \t');
    const HEX_CHARS = new Set('0123456789abcdefABCDEF');

    class State {
        constructor(initial, final) {
            this.current = initial;
            this.next = [final];
        }

        push(next, i) {
            if (this.next.length > MAX_DEPTH) {
                throw new ParseError('max depth reached', i);
            }

            this.next.push(next);
        }

        pop() {
            this.current = this.next.pop();
        }
    }

    function formatJson(str) {
        let result = '';

        let indent = 0;
        let formatBefore = '';
        let formatAfter = '';

        const len = str.length;
        const state = new State(S.VALUE, S.END);
        for (let i = 0; i < len; i++) {
            const c = str[i];

            switch (state.current) {
                case S.VALUE:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === '"') {
                        state.current = S.STRING;
                    } else if (NUMBER_START_CHARS.has(c)) {
                        state.current = S.NUMBER;
                    } else if (c === '{') {
                        state.current = S.OBJECT;
                    } else if (c === '[') {
                        state.current = S.ARRAY;
                    } else if (c === 't') {
                        state.current = S.TRUE_1;
                    } else if (c === 'f') {
                        state.current = S.FALSE_1;
                    } else if (c === 'n') {
                        state.current = S.NULL_1;
                    } else if (c === 'N') {
                        state.current = S.NAN_1;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.STRING:
                    if (c === '\\') {
                        state.current = S.STRING_SLASHED;
                        state.push(S.STRING, i);
                    } else if (c === '"') {
                        state.pop();
                    } else {
                        // TODO: is this a valid character in the string?
                    }
                    break;
                case S.STRING_SLASHED:
                    if (STRING_ESCAPED_CHARS.has(c)) {
                        state.pop();
                    } else if (c === 'u') {
                        state.current = S.STRING_SLASHED_U_1;
                    } else {
                        throw new ParseError(
                            'invalid escaped char in string',
                            i
                        );
                    }
                    break;
                case S.STRING_SLASHED_U_1:
                    if (HEX_CHARS.has(c)) {
                        state.current = S.STRING_SLASHED_U_2;
                    } else {
                        throw new ParseError(
                            'invalid escaped unicode in string',
                            i
                        );
                    }
                    break;
                case S.STRING_SLASHED_U_2:
                    if (HEX_CHARS.has(c)) {
                        state.current = S.STRING_SLASHED_U_3;
                    } else {
                        throw new ParseError(
                            'invalid escaped unicode in string',
                            i
                        );
                    }
                    break;
                case S.STRING_SLASHED_U_3:
                    if (HEX_CHARS.has(c)) {
                        state.current = S.STRING_SLASHED_U_4;
                    } else {
                        throw new ParseError(
                            'invalid escaped unicode in string',
                            i
                        );
                    }
                    break;
                case S.STRING_SLASHED_U_4:
                    if (HEX_CHARS.has(c)) {
                        state.pop();
                    } else {
                        throw new ParseError(
                            'invalid escaped unicode in string',
                            i
                        );
                    }
                    break;
                case S.NUMBER:
                    // TODO: validate number format?
                    if (!NUMBER_CHARS.has(c)) {
                        state.pop();
                        i--;
                        continue;
                    }
                    break;
                case S.OBJECT:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === '"') {
                        indent += INDENT_SIZE;
                        formatBefore = generateIndent(indent);
                        state.current = S.STRING;
                        state.push(S.OBJECT_VALUE, i);
                    } else if (c === '}') {
                        state.pop();
                    } else {
                        throw new ParseError('invalid object', i);
                    }
                    break;
                case S.OBJECT_KEY:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === '"') {
                        state.current = S.STRING;
                        state.push(S.OBJECT_VALUE, i);
                    } else {
                        throw new ParseError('invalid object key', i);
                    }
                    break;
                case S.OBJECT_VALUE:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === ':') {
                        formatAfter = ' ';
                        state.current = S.VALUE;
                        state.push(S.OBJECT_VALUE_END, i);
                    } else {
                        throw new ParseError('invalid object value', i);
                    }
                    break;
                case S.OBJECT_VALUE_END:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === ',') {
                        formatAfter = generateIndent(indent);
                        state.current = S.OBJECT_KEY;
                    } else if (c === '}') {
                        indent -= INDENT_SIZE;
                        formatBefore = generateIndent(indent);
                        state.pop();
                    } else {
                        throw new ParseError('invalid object', i);
                    }
                    break;
                case S.ARRAY:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === ']') {
                        state.pop();
                    } else {
                        indent += INDENT_SIZE;
                        formatBefore = generateIndent(indent);
                        state.current = S.VALUE;
                        state.push(S.ARRAY_VALUE_END, i);
                        i--;
                        continue;
                    }
                    break;
                case S.ARRAY_VALUE_END:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    if (c === ',') {
                        formatAfter = generateIndent(indent);
                        state.current = S.VALUE;
                        state.push(S.ARRAY_VALUE_END, i);
                    } else if (c === ']') {
                        indent -= INDENT_SIZE;
                        formatBefore = generateIndent(indent);
                        state.pop();
                    } else {
                        throw new ParseError('invalid array', i);
                    }
                    break;
                case S.TRUE_1:
                    if (c === 'r') {
                        state.current = S.TRUE_2;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.TRUE_2:
                    if (c === 'u') {
                        state.current = S.TRUE_3;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.TRUE_3:
                    if (c === 'e') {
                        state.pop();
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.FALSE_1:
                    if (c === 'a') {
                        state.current = S.FALSE_2;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.FALSE_2:
                    if (c === 'l') {
                        state.current = S.FALSE_3;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.FALSE_3:
                    if (c === 's') {
                        state.current = S.FALSE_4;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.FALSE_4:
                    if (c === 'e') {
                        state.pop();
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.NULL_1:
                    if (c === 'u') {
                        state.current = S.NULL_2;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.NULL_2:
                    if (c === 'l') {
                        state.current = S.NULL_3;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.NULL_3:
                    if (c === 'l') {
                        state.pop();
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.NAN_1:
                    if (c === 'a') {
                        state.current = S.NAN_2;
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.NAN_2:
                    if (c === 'N') {
                        state.pop();
                    } else {
                        throw new ParseError('invalid value', i);
                    }
                    break;
                case S.END:
                    if (WHITESPACE_CHARS.has(c)) continue;
                    throw new ParseError('invalid end', i);
                default:
                    throw new ParseError('invalid state', i);
            }

            result += formatBefore + c + formatAfter;
            formatBefore = '';
            formatAfter = '';
        }
        if (state.current === S.NUMBER) {
            state.pop();
        }

        if (state.current !== S.END) {
            throw new ParseError('incomplete json', len);
        }

        return result;
    }

    function generateIndent(indent) {
        return '\n' + ' '.repeat(indent);
    }

    class ParseError extends Error {
        constructor(msg, i) {
            super(`ParseError at ${i}: ${msg}`);
        }
    }

    return {
        formatJson,
        ParseError,
    };
});
