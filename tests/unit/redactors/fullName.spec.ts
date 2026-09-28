import { redactFullName } from '../../../src/redactors/fullName'

describe('redactFullName', () => {
    describe('title case names', () => {
        const cases = [
            { input: 'Шевченко Тарас Григорович', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'Шевченко Тарас', expected: '[Fullname redacted: Ш.Т.]' },
            { input: 'Шевченко Тарас Григорович-Кобзар', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'раз Шевченко Тарас два', expected: 'раз [Fullname redacted: Ш.Т.] два' },
            { input: 'Shevchenko Taras Hryhorovych', expected: '[Fullname redacted: S.T.H.]' },
        ]

        it.each(cases)('redacts "$input"', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })

    describe('uppercase names', () => {
        const cases = [
            { input: 'ШЕВЧЕНКО ТАРАС ГРИГОРОВИЧ', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'SHEVCHENKO TARAS HRYHOROVYCH', expected: '[Fullname redacted: S.T.H.]' },
            { input: 'NGUYEN VAN AN', expected: '[Fullname redacted: N.V.A.]' },
            { input: 'JOHN SMITH', expected: '[Fullname redacted: J.S.]' },
            { input: 'ŁUKASZ ŻAK', expected: '[Fullname redacted: Ł.Ż.]' },
            { input: 'MÜLLER HANS', expected: '[Fullname redacted: M.H.]' },
            { input: 'ШЕВЧЕНКО-КОБЗАР ТАРАС-ПЕТРО ГРИГОРОВИЧ', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'ШЕВЧЕНКО Тарас Григорович', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'Платник: ШЕВЧЕНКО ТАРАС ГРИГОРОВИЧ, рнокпп', expected: 'Платник: [Fullname redacted: Ш.Т.Г.], рнокпп' },
        ]

        it.each(cases)('redacts "$input"', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })

    describe('names outside the latin and cyrillic ascii ranges', () => {
        const cases = [
            { input: 'Łukasz Żak', expected: '[Fullname redacted: Ł.Ż.]' },
            { input: 'Öztürk Ahmet', expected: '[Fullname redacted: Ö.A.]' },
            { input: 'Şahin Emre', expected: '[Fullname redacted: Ş.E.]' },
            { input: "O'Brien Sean", expected: '[Fullname redacted: O.S.]' },
        ]

        it.each(cases)('redacts "$input"', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })

    describe('surrounding text', () => {
        const cases = [
            { input: 'Шевченко Тарас Григорович, рнокпп: 1234567890', expected: '[Fullname redacted: Ш.Т.Г.], рнокпп: 1234567890' },
            { input: 'звернення від Шевченко Тарас.', expected: 'звернення від [Fullname redacted: Ш.Т.].' },
            { input: '(Шевченко Тарас)', expected: '([Fullname redacted: Ш.Т.])' },
            { input: 'Шевченко Тарас\nКоваленко Андрій', expected: '[Fullname redacted: Ш.Т.]\n[Fullname redacted: К.А.]' },
        ]

        it.each(cases)('preserves the text around "$input"', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })

    describe('values that must stay readable', () => {
        const cases = [
            'Головне управління Пенсійного фонду України в Дніпропетровській області',
            'Шевченко',
            'ШЕВЧЕНКО',
            'IPhone12 Pro',
            'UA213223130000026007233566001',
            'BACK-1234 ready',
            '',
        ]

        it.each(cases)('leaves "%s" untouched', (input) => {
            expect(redactFullName(input)).toBe(input)
        })
    })

    describe('knowingly over-redacted non-names', () => {
        const cases = [
            { input: 'FORD FOCUS', expected: '[Fullname redacted: F.F.]' },
            { input: 'ГРАНТ ВИПЛАЧЕНО', expected: '[Fullname redacted: Г.В.]' },
            { input: 'INTERNAL SERVER ERROR', expected: '[Fullname redacted: I.S.E.]' },
        ]

        it.each(cases)('redacts "$input" as the accepted cost of uppercase coverage', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })
})
