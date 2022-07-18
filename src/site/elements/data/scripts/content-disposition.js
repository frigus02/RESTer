/**
 * (c) 2017 Rob Wu <rob@robwu.nl> (https://robwu.nl)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
/* exported getFilenameFromContentDispositionHeader */

/**
 * Extract file name from the Content-Disposition HTTP response header.
 *
 * @param {string} contentDisposition
 * @return {string} Filename, if found in the Content-Disposition header.
 */
export function getFilenameFromContentDispositionHeader(contentDisposition) {
    // This parser is designed to be tolerant and accepting of headers that do
    // not comply with the standard, but accepted by Firefox.

    let needsEncodingFixup = true;

    // filename*=ext-value ("ext-value" from RFC 5987, referenced by RFC 6266).
    let tmp = toParamRegExp('filename\\*', 'i').exec(contentDisposition);
    if (tmp) {
        tmp = tmp[1];
        let filename = rfc2616unquote(tmp);
        filename = unescape(filename);
        filename = rfc5987decode(filename);
        filename = rfc2047decode(filename);
        return fixupEncoding(filename);
    }

    // Continuations (RFC 2231 section 3, referenced by RFC 5987 section 3.1).
    // filename*n*=part
    // filename*n=part
    tmp = rfc2231getparam(contentDisposition);
    if (tmp) {
        // RFC 2047, section
        let filename = rfc2047decode(tmp);
        return fixupEncoding(filename);
    }

    // filename=value (RFC 5987, section 4.1).
    tmp = toParamRegExp('filename', 'i').exec(contentDisposition);
    if (tmp) {
        tmp = tmp[1];
        let filename = rfc2616unquote(tmp);
        filename = rfc2047decode(filename);
        return fixupEncoding(filename);
    }
    return '';

    function toParamRegExp(attributePattern, flags) {
        return new RegExp(
            '(?:^|;)\\s*' +
                attributePattern +
                '\\s*=\\s*' +
                // Captures: value = token | quoted-string
                // (RFC 2616, section 3.6 and referenced by RFC 6266 4.1)
                '(' +
                '(?!")[^;]+' +
                '|' +
                '"(?:[^"\\\\]|\\\\"?)+"?' +
                ')',
            flags
        );
    }
    function textdecode(encoding, value) {
        if (encoding) {
            try {
                let decoder = new TextDecoder(encoding, { fatal: true });
                let bytes = Array.from(value, (c) => c.charCodeAt(0));
                if (bytes.every((code) => code <= 0xff)) {
                    value = decoder.decode(new Uint8Array(bytes));
                    needsEncodingFixup = false;
                }
            } catch (e) {
                // TextDecoder constructor threw - unrecognized encoding.
            }
        }
        return value;
    }
    function fixupEncoding(value) {
        if (needsEncodingFixup && /[\x80-\xff]/.test(value)) {
            // Maybe multi-byte UTF-8.
            value = textdecode('utf-8', value);
            if (needsEncodingFixup) {
                // Try iso-8859-1 encoding.
                value = textdecode('iso-8859-1', value);
            }
        }
        return value;
    }
    function rfc2231getparam(contentDisposition) {
        let matches = [],
            match;
        // Iterate over all filename*n= and filename*n*= with n being an integer
        // of at least zero. Any non-zero number must not start with '0'.
        let iter = toParamRegExp('filename\\*((?!0\\d)\\d+)(\\*?)', 'ig');
        while ((match = iter.exec(contentDisposition)) !== null) {
            let [, n, quot, part] = match;
            n = parseInt(n, 10);
            if (n in matches) {
                // Ignore anything after the invalid second filename*0.
                if (n === 0) break;
                continue;
            }
            matches[n] = [quot, part];
        }
        let parts = [];
        for (let n = 0; n < matches.length; ++n) {
            if (!(n in matches)) {
                // Numbers must be consecutive. Truncate when there is a hole.
                break;
            }
            let [quot, part] = matches[n];
            part = rfc2616unquote(part);
            if (quot) {
                part = unescape(part);
                if (n === 0) {
                    part = rfc5987decode(part);
                }
            }
            parts.push(part);
        }
        return parts.join('');
    }
    function rfc2616unquote(value) {
        if (value.startsWith('"')) {
            let parts = value.slice(1).split('\\"');
            // Find the first unescaped " and terminate there.
            for (let i = 0; i < parts.length; ++i) {
                let quotindex = parts[i].indexOf('"');
                if (quotindex !== -1) {
                    parts[i] = parts[i].slice(0, quotindex);
                    parts.length = i + 1; // Truncates and stop the iteration.
                }
                parts[i] = parts[i].replace(/\\(.)/g, '$1');
            }
            value = parts.join('"');
        } else {
            value = value.replace(/[\r\n]/g, '');
            // Exclude trailing whitespace that's matched by toParamRegExp.
            value = value.replace(/\s+$/, '');
        }
        return value;
    }
    function rfc5987decode(extvalue) {
        // Decodes "ext-value" from RFC 5987.
        let encodingend = extvalue.indexOf("'");
        if (encodingend === -1) {
            // Some servers send "filename*=" without encoding'language' prefix,
            // e.g. in https://github.com/Rob--W/open-in-browser/issues/26
            // Let's accept the value like Firefox (57) (Chrome 62 rejects it).
            return extvalue;
        }
        let encoding = extvalue.slice(0, encodingend);
        let langvalue = extvalue.slice(encodingend + 1);
        // Ignore language (RFC 5987 section 3.2.1, and RFC 6266 section 4.1 ).
        let value = langvalue.replace(/^[^']*'/, '');
        return textdecode(encoding, value);
    }
    function rfc2047decode(value) {
        // RFC 2047-decode the result. Firefox tried to drop support for it, but
        // backed out because some servers use it - https://bugzil.la/875615
        // Firefox's condition for decoding is here: https://searchfox.org/mozilla-central/rev/4a590a5a15e35d88a3b23dd6ac3c471cf85b04a8/netwerk/mime/nsMIMEHeaderParamImpl.cpp#742-748

        // We are more strict and only recognize RFC 2047-encoding if the value
        // starts with "=?", since then it is likely that the full value is
        // RFC 2047-encoded.

        // Firefox also decodes words even where RFC 2047 section 5 states:
        // "An 'encoded-word' MUST NOT appear within a 'quoted-string'."

        // eslint-disable-next-line no-control-regex
        if (!value.startsWith('=?') || /[\x00-\x19\x80-\xff]/.test(value)) {
            return value;
        }
        // RFC 2047, section 2.4
        // encoded-word = "=?" charset "?" encoding "?" encoded-text "?="
        // charset = token (but let's restrict to characters that denote a
        //           possibly valid encoding).
        // encoding = q or b
        // encoded-text = any printable ASCII character other than ? or space.
        //                ... but Firefox permits ? and space.
        return value.replace(
            /=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g,
            function (_, charset, encoding, text) {
                if (encoding === 'q' || encoding === 'Q') {
                    // RFC 2047 section 4.2.
                    text = text.replace(/_/g, ' ');
                    text = text.replace(/=([0-9a-fA-F]{2})/g, (_, hex) =>
                        String.fromCharCode(parseInt(hex, 16))
                    );
                    return textdecode(charset, text);
                } // else encoding is b or B - base64 (RFC 2047 section 4.1)
                try {
                    text = atob(text);
                } catch (e) {}
                return textdecode(charset, text);
            }
        );
    }
}
