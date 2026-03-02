function checkIsLowercaseLetter(char: string | undefined): boolean {
    const code = char?.codePointAt(0)
    if (code === undefined) {
        return false
    }

    const isLatin = code >= 97 && code <= 122 // a-z
    if (isLatin) {
        return true
    }

    const isUkrainian =
        (code >= 0x04_30 && code <= 0x04_4f) || // а-я
        code === 0x04_54 || // є
        code === 0x04_56 || // і
        code === 0x04_57 || // ї
        code === 0x04_91 // ґ

    return isUkrainian
}

function findNextWordBoundary(text: string, startIndex: number): number {
    for (let i = startIndex; i < text.length; i++) {
        const char = text[i]
        if (char === ' ') {
            return i
        }
    }

    return text.length
}

function isUpperCase(char: string | undefined): boolean {
    const isLetter = checkIsLowercaseLetter(char?.toLowerCase())

    return isLetter && char === char?.toUpperCase()
}

function isNamePart(word: string | undefined): boolean {
    if (!isUpperCase(word?.[0])) {
        return false
    }

    let prevChar
    for (let i = 1; i < (word?.length || 0); i++) {
        const char = word?.[i]
        if (checkIsLowercaseLetter(char) || char === '-' || (prevChar === '-' && checkIsLowercaseLetter(char?.toLowerCase()))) {
            return true
        }

        prevChar = char
    }

    return false
}

function extractFullName(text: string, startIndex: number): [string | undefined, number] {
    const parts: string[] = []
    let currentIndex = startIndex

    while (currentIndex < text.length) {
        const wordEnd = findNextWordBoundary(text, currentIndex)
        const word = text.slice(currentIndex, wordEnd)

        if (!isNamePart(word)) {
            break
        }

        parts.push(word)

        currentIndex = wordEnd

        if (currentIndex < text.length && text[currentIndex] === ' ') {
            if (parts.length >= 6) {
                break
            }

            currentIndex++
        } else {
            break
        }
    }

    if (parts.length >= 2 && parts.length <= 6) {
        return [parts.join(' '), currentIndex]
    }

    return [undefined, startIndex]
}

function nameToInitials(fullName: string): string {
    return fullName
        .split(/\s/)
        .map((part) => `${part.split('-')[0][0]}.`)
        .join('')
}

export function redactFullName(text: string): string {
    let result = ''
    let currentIndex = 0

    while (currentIndex < text.length) {
        const currentChar = text[currentIndex]
        if (isUpperCase(currentChar)) {
            const [fullName, endIndex] = extractFullName(text, currentIndex)

            if (fullName) {
                const initials = nameToInitials(fullName)

                result += `[Fullname redacted: ${initials}] `
                currentIndex = endIndex
                continue
            }
        }

        result += text[currentIndex]
        currentIndex++
    }

    return result
}
