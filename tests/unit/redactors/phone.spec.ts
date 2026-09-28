import { redactPhone } from '../../../src/redactors/phone'

describe('redactPhone', () => {
    const cases = [
        { input: '+380991234567', expected: '+38099******7' },
        { input: 'тел.: +380991234567', expected: 'тел.: +38099******7' },
        { input: '+38 (099) 123-45-67', expected: '+38099******7' },
        { input: '0991234567', expected: '099******7' },
        { input: '380991234567', expected: '38099******7' },
        { input: '48537163208', expected: '4853******8' },
        { input: '+48537163208', expected: '+4853******8' },
        { input: '+48 537 163 208', expected: '+4853******8' },
        { input: 'тел.: 48537163208', expected: 'тел.: 4853******8' },
        { input: '491701234567890', expected: '49170123******0' },
        { input: '1234567890123456', expected: '1234567890123456' },
        { input: 'call 0991234567 today', expected: 'call 099******7 today' },
        { input: '123456789', expected: '123456789' },
        { input: 'no phone here', expected: 'no phone here' },
        { input: '', expected: '' },
    ]

    it.each(cases)('redacts "$input" -> "$expected"', ({ input, expected }) => {
        expect(redactPhone(input)).toBe(expected)
    })
})
