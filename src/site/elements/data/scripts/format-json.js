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
        END: s++,
    };
})();
const INDENT_SIZE = 4;
const NUMBER_START_CHARS = new Set('-0123456789');
const NUMBER_CHARS = new Set('-+0123456789.eE');
const STRING_ESCAPED_CHARS = new Set('"\\/bfnrt');
const WHITESPACE_CHARS = new Set('\r\n \t');
const HEX_CHARS = new Set('0123456789abcdefABCDEF');

export function formatJson(str) {
    let result = '';

    let indent = 0;
    let formatBefore = '';
    let formatAfter = '';

    const len = str.length;
    let state = S.VALUE;
    let nextState = [S.END];
    for (let i = 0; i < len; i++) {
        const c = str[i];

        if (state === S.VALUE) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === '"') {
                state = S.STRING;
            } else if (NUMBER_START_CHARS.has(c)) {
                state = S.NUMBER;
            } else if (c === '{') {
                state = S.OBJECT;
            } else if (c === '[') {
                state = S.ARRAY;
            } else if (c === 't') {
                state = S.TRUE_1;
            } else if (c === 'f') {
                state = S.FALSE_1;
            } else if (c === 'n') {
                state = S.NULL_1;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.STRING) {
            if (c === '\\') {
                state = S.STRING_SLASHED;
                nextState.push(S.STRING);
            } else if (c === '"') {
                state = nextState.pop();
            } else {
                // TODO: is this a valid character in the string?
            }
        } else if (state === S.STRING_SLASHED) {
            if (STRING_ESCAPED_CHARS.has(c)) {
                state = nextState.pop();
            } else if (c === 'u') {
                state = S.STRING_SLASHED_U_1;
            } else {
                throw new ParseError('invalid escaped char in string', i);
            }
        } else if (state === S.STRING_SLASHED_U_1) {
            if (HEX_CHARS.has(c)) {
                state = S.STRING_SLASHED_U_2;
            } else {
                throw new ParseError('invalid escaped unicode in string', i);
            }
        } else if (state === S.STRING_SLASHED_U_2) {
            if (HEX_CHARS.has(c)) {
                state = S.STRING_SLASHED_U_3;
            } else {
                throw new ParseError('invalid escaped unicode in string', i);
            }
        } else if (state === S.STRING_SLASHED_U_3) {
            if (HEX_CHARS.has(c)) {
                state = S.STRING_SLASHED_U_4;
            } else {
                throw new ParseError('invalid escaped unicode in string', i);
            }
        } else if (state === S.STRING_SLASHED_U_4) {
            if (HEX_CHARS.has(c)) {
                state = nextState.pop();
            } else {
                throw new ParseError('invalid escaped unicode in string', i);
            }
        } else if (state === S.NUMBER) {
            // TODO: validate number format?
            if (!NUMBER_CHARS.has(c)) {
                state = nextState.pop();
                i--;
                continue;
            }
        } else if (state === S.OBJECT) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === '"') {
                indent += INDENT_SIZE;
                formatBefore = generateIndent(indent);
                state = S.STRING;
                nextState.push(S.OBJECT_VALUE);
            } else if (c === '}') {
                state = nextState.pop();
            } else {
                throw new ParseError('invalid object', i);
            }
        } else if (state === S.OBJECT_KEY) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === '"') {
                state = S.STRING;
                nextState.push(S.OBJECT_VALUE);
            } else {
                throw new ParseError('invalid object key', i);
            }
        } else if (state === S.OBJECT_VALUE) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === ':') {
                formatAfter = ' ';
                state = S.VALUE;
                nextState.push(S.OBJECT_VALUE_END);
            } else {
                throw new ParseError('invalid object value', i);
            }
        } else if (state === S.OBJECT_VALUE_END) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === ',') {
                formatAfter = generateIndent(indent);
                state = S.OBJECT_KEY;
            } else if (c === '}') {
                indent -= INDENT_SIZE;
                formatBefore = generateIndent(indent);
                state = nextState.pop();
            } else {
                throw new ParseError('invalid object', i);
            }
        } else if (state === S.ARRAY) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === ']') {
                state = nextState.pop();
            } else {
                indent += INDENT_SIZE;
                formatBefore = generateIndent(indent);
                state = S.VALUE;
                nextState.push(S.ARRAY_VALUE_END);
                i--;
                continue;
            }
        } else if (state === S.ARRAY_VALUE_END) {
            if (WHITESPACE_CHARS.has(c)) continue;
            if (c === ',') {
                formatAfter = generateIndent(indent);
                state = S.VALUE;
                nextState.push(S.ARRAY_VALUE_END);
            } else if (c === ']') {
                indent -= INDENT_SIZE;
                formatBefore = generateIndent(indent);
                state = nextState.pop();
            } else {
                throw new ParseError('invalid array', i);
            }
        } else if (state === S.TRUE_1) {
            if (c === 'r') {
                state = S.TRUE_2;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.TRUE_2) {
            if (c === 'u') {
                state = S.TRUE_3;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.TRUE_3) {
            if (c === 'e') {
                state = nextState.pop();
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.FALSE_1) {
            if (c === 'a') {
                state = S.FALSE_2;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.FALSE_2) {
            if (c === 'l') {
                state = S.FALSE_3;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.FALSE_3) {
            if (c === 's') {
                state = S.FALSE_4;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.FALSE_4) {
            if (c === 'e') {
                state = nextState.pop();
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.NULL_1) {
            if (c === 'u') {
                state = S.NULL_2;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.NULL_2) {
            if (c === 'l') {
                state = S.NULL_3;
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.NULL_3) {
            if (c === 'l') {
                state = nextState.pop();
            } else {
                throw new ParseError('invalid value', i);
            }
        } else if (state === S.END) {
            if (WHITESPACE_CHARS.has(c)) continue;
            throw new ParseError('invalid end', i);
        }

        result += formatBefore + c + formatAfter;
        formatBefore = '';
        formatAfter = '';
    }
    if (state === S.NUMBER) {
        state = nextState.pop();
    }

    if (state !== S.END) {
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
