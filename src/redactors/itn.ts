export function redactItn(text: string): string {
    const itnLength = 10
    if (!text || text.length < itnLength) {
        return text
    }

    let result = text
    let offset = 0

    for (let i = 0; i <= text.length - itnLength; i++) {
        let digitCount = 0
        const startIndex = i

        // Count consecutive digits starting from position i
        while (i < text.length && isDigit(text[i])) {
            digitCount++
            i++
        }

        // If we found exactly 10 digits
        if (digitCount === 10) {
            // Check what comes before the sequence (if anything)
            const charBefore = startIndex > 0 ? text[startIndex - 1] : null
            // Check what comes after the sequence (if anything)
            const charAfter = i < text.length ? text[i] : null

            // Valid if:
            // - It's the entire string, OR
            // - It's wrapped by valid boundary characters (delimiters, quotes, etc.)
            if (isValidBoundary(charBefore) && isValidBoundary(charAfter)) {
                // Calculate positions in the result string accounting for previous replacements
                const resultStartIndex = startIndex + offset
                const resultEndIndex = resultStartIndex + itnLength

                const replacement = '[...itn redacted...]'
                const unmaskBoundary = 2

                result =
                    result.slice(0, Math.max(0, resultStartIndex + unmaskBoundary)) +
                    replacement +
                    result.slice(Math.max(0, resultEndIndex - unmaskBoundary))

                // Update offset (chars for replacement - chars for original replaced sequence)
                offset += replacement.length - (itnLength - 2 * unmaskBoundary)

                i = startIndex + itnLength - 1
            }
        }

        if (digitCount > 0) {
            i = startIndex + digitCount - 1
        }
    }

    return result
}

function isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
}

const validBoundaryChars = new Set([
    ' ',
    '\t',
    '\n',
    '\r',
    '.',
    ',',
    ';',
    ':',
    '!',
    '?',
    '"',
    "'",
    '`',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '<',
    '>',
])

function isValidBoundary(char: string | null): boolean {
    // null means start/end of string - always valid
    if (char === null) {
        return true
    }

    return validBoundaryChars.has(char)
}
