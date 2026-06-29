const EMAIL_PATTERN = /([\w.%+-]+)@([\w.-]+\.[a-z]{2,})/gi

export function redactEmail(text: string): string {
    if (!text.includes('@')) {
        return text
    }

    return text.replace(EMAIL_PATTERN, (_match, local: string, domain: string) => {
        const prefix = local.length >= 2 ? local[0] : ''

        return `${prefix}***@${domain}`
    })
}
