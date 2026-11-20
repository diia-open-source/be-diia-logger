const minParts = 2
const maxParts = 6

const nameSeparators = new Set(["'", '’', 'ʼ', '`', '‘', '-'])
const inWordApostrophePattern = /['’ʼ`‘](?=[яюєї])/g
const initialsPattern = / *(?<!\p{L})\p{Lu}\.(?: *\p{Lu}\.){1,2} */uy

function isCasedLetter(char: string): boolean {
    return char.toLowerCase() !== char.toUpperCase()
}

function isUpperCaseLetter(char: string): boolean {
    return isCasedLetter(char) && char === char.toUpperCase()
}

function isLowerCaseLetter(char: string): boolean {
    return isCasedLetter(char) && char === char.toLowerCase()
}

function isNameChar(text: string, index: number): boolean {
    const char = text[index]
    const isClosingQuote = char !== '-' && !isCasedLetter(text.charAt(index + 1))

    return isCasedLetter(char) || (nameSeparators.has(char) && !isClosingQuote)
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
        if (!isNameChar(text, i)) {
            return i
        }
    }

    return text.length
}

function isNamePart(word: string): boolean {
    if (word.length < 2) {
        return false
    }

    const segments = splitSegments(word.replace(inWordApostrophePattern, ''))
    if (segments.some((segment) => segment === '')) {
        return false
    }

    return segments.every((segment) => isTitleCaseSegment(segment)) || segments.every((segment) => isUpperCaseSegment(segment))
}

function readNamePart(text: string, startIndex: number): string {
    const word = text.slice(startIndex, findNextWordBoundary(text, startIndex))

    return isNamePart(word) ? word : ''
}

function extractNameWithInitials(text: string, startIndex: number): [string | undefined, number] {
    const leadingWord = readNamePart(text, startIndex)

    initialsPattern.lastIndex = startIndex + leadingWord.length

    const initials = initialsPattern.exec(text)?.[0]
    if (!initials) {
        return [undefined, startIndex]
    }

    const trailingWord = readNamePart(text, initialsPattern.lastIndex)
    if (!leadingWord && !trailingWord) {
        return [undefined, startIndex]
    }

    const fullName = `${leadingWord}${initials}${trailingWord}`.trimEnd()

    return [fullName, startIndex + fullName.length]
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

    return extractNameWithInitials(text, startIndex)
}

function nameToInitials(fullName: string): string {
    return fullName
        .split(/[ .]+/)
        .filter(Boolean)
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
