const minParts = 2
const maxParts = 6

const nameSeparators = new Set(["'", '’', '-'])

function isCasedLetter(char: string): boolean {
    return char.toLowerCase() !== char.toUpperCase()
}

function isUpperCaseLetter(char: string): boolean {
    return isCasedLetter(char) && char === char.toUpperCase()
}

function isLowerCaseLetter(char: string): boolean {
    return isCasedLetter(char) && char === char.toLowerCase()
}

function isNameChar(char: string): boolean {
    return isCasedLetter(char) || nameSeparators.has(char)
}

function splitSegments(word: string): string[] {
    const segments: string[] = []
    let current = ''

    for (const char of word) {
        if (nameSeparators.has(char)) {
            segments.push(current)
            current = ''
        } else {
            current += char
        }
    }

    segments.push(current)

    return segments
}

function isTitleCaseSegment(segment: string): boolean {
    if (!isUpperCaseLetter(segment[0])) {
        return false
    }

    for (let i = 1; i < segment.length; i++) {
        if (!isLowerCaseLetter(segment[i])) {
            return false
        }
    }

    return true
}

function isUpperCaseSegment(segment: string): boolean {
    for (const char of segment) {
        if (!isUpperCaseLetter(char)) {
            return false
        }
    }

    return true
}

function findNextWordBoundary(text: string, startIndex: number): number {
    for (let i = startIndex; i < text.length; i++) {
        if (!isNameChar(text[i])) {
            return i
        }
    }

    return text.length
}

function isNamePart(word: string): boolean {
    if (word.length < 2) {
        return false
    }

    const segments = splitSegments(word)
    if (segments.some((segment) => segment === '')) {
        return false
    }

    return segments.every((segment) => isTitleCaseSegment(segment)) || segments.every((segment) => isUpperCaseSegment(segment))
}

function extractFullName(text: string, startIndex: number): [string | undefined, number] {
    const parts: string[] = []
    let currentIndex = startIndex
    let endIndex = startIndex

    while (currentIndex < text.length && parts.length < maxParts) {
        const wordEnd = findNextWordBoundary(text, currentIndex)
        const word = text.slice(currentIndex, wordEnd)

        if (!isNamePart(word)) {
            break
        }

        parts.push(word)
        endIndex = wordEnd

        if (text[wordEnd] !== ' ') {
            break
        }

        currentIndex = wordEnd + 1
    }

    if (parts.length >= minParts) {
        return [parts.join(' '), endIndex]
    }

    return [undefined, startIndex]
}

function nameToInitials(fullName: string): string {
    return fullName
        .split(' ')
        .map((part) => `${splitSegments(part)[0][0]}.`)
        .join('')
}

export function redactFullName(text: string): string {
    let result = ''
    let currentIndex = 0

    while (currentIndex < text.length) {
        if (isUpperCaseLetter(text[currentIndex])) {
            const [fullName, endIndex] = extractFullName(text, currentIndex)

            if (fullName) {
                result += `[Fullname redacted: ${nameToInitials(fullName)}]`
                currentIndex = endIndex
                continue
            }
        }

        result += text[currentIndex]
        currentIndex++
    }

    return result
}
