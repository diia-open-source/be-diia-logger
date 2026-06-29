import { redactEmail } from '../../../src/redactors/email'

describe('redactEmail', () => {
    const cases = [
        { input: 'john.doe@gmail.com', expected: 'j***@gmail.com' },
        { input: 'test@test.ua', expected: 't***@test.ua' },
        { input: 'a@x.ua', expected: '***@x.ua' },
        { input: 'john+tag@gmail.com', expected: 'j***@gmail.com' },
        { input: 'mail me at a@b.com pls', expected: 'mail me at ***@b.com pls' },
        { input: 'two a@b.com and c.d@e.org', expected: 'two ***@b.com and c***@e.org' },
        { input: 'N/A', expected: 'N/A' },
        { input: 'a@@b', expected: 'a@@b' },
        { input: '', expected: '' },
    ]

    it.each(cases)('redacts "$input" -> "$expected"', ({ input, expected }) => {
        expect(redactEmail(input)).toBe(expected)
    })
})
