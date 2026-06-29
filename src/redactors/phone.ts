// Liberal candidate: optional '+', then a digit-led run that may contain spaces,
// parentheses, dots and dashes. Validated by digit count in maskPhone.
const PHONE_CANDIDATE = /\+?\d[\d\s().-]{7,18}\d/g

const nationalDigits = 10
const internationalDigits = 12
const subscriberDigits = 7

export function redactPhone(text: string): string {
    return text.replace(PHONE_CANDIDATE, (match) => maskPhone(match))
}

function maskPhone(match: string): string {
    const digits = match.replace(/\D/g, '')
    const isNational = digits.length === nationalDigits && digits.startsWith('0')
    const isInternational = digits.length === internationalDigits
    if (!isNational && !isInternational) {
        return match
    }

    // Keep the country/operator code and the last digit; mask the subscriber number.
    const prefix = match.startsWith('+') ? '+' : ''

    return `${prefix}${digits.slice(0, -subscriberDigits)}${'*'.repeat(subscriberDigits - 1)}${digits.slice(-1)}`
}
