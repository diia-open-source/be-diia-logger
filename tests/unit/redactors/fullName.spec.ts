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

    describe('names with an apostrophe', () => {
        const cases = [
            { input: "Шевченко В'ячеслав Тарасович", expected: '[Fullname redacted: Ш.В.Т.]' },
            { input: 'Шевченко В’ячеслав Тарасович', expected: '[Fullname redacted: Ш.В.Т.]' },
            { input: 'Шевченко Вʼячеслав Тарасович', expected: '[Fullname redacted: Ш.В.Т.]' },
            { input: 'Шевченко В`ячеслав Тарасович', expected: '[Fullname redacted: Ш.В.Т.]' },
            { input: 'Шевченко В‘ячеслав Тарасович', expected: '[Fullname redacted: Ш.В.Т.]' },
            { input: "Солов'яненко Мар'яна Валер'янівна", expected: '[Fullname redacted: С.М.В.]' },
            { input: "Шевченко Дар'я Петрівна", expected: '[Fullname redacted: Ш.Д.П.]' },
            { input: 'Шевченко Дарʼя Тарасівна', expected: '[Fullname redacted: Ш.Д.Т.]' },
            { input: "Шевченко Дар'ї Петрівни", expected: '[Fullname redacted: Ш.Д.П.]' },
            { input: "Шевченко Дар'ю Петрівну", expected: '[Fullname redacted: Ш.Д.П.]' },
            { input: "Дар'є Петрівно", expected: '[Fullname redacted: Д.П.]' },
            { input: "П'ЯТНИЧУК ДЕМ'ЯН", expected: '[Fullname redacted: П.Д.]' },
            { input: "'Шевченко Тарас'", expected: "'[Fullname redacted: Ш.Т.]'" },
            { input: '`Шевченко Тарас`', expected: '`[Fullname redacted: Ш.Т.]`' },
        ]

        it.each(cases)('redacts "$input"', ({ input, expected }) => {
            expect(redactFullName(input)).toBe(expected)
        })
    })

    describe('names with initials', () => {
        const cases = [
            { input: 'Шевченко Т.Г.', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'Шевченко Т. Г.', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'ШЕВЧЕНКО Т.Г.', expected: '[Fullname redacted: Ш.Т.Г.]' },
            { input: 'Т.Г. Шевченко', expected: '[Fullname redacted: Т.Г.Ш.]' },
            { input: 'Т.Г.Шевченко', expected: '[Fullname redacted: Т.Г.Ш.]' },
            { input: 'J.R.R. Tolkien', expected: '[Fullname redacted: J.R.R.T.]' },
            { input: 'ТЦК та СП. Т.Г. Шевченко', expected: 'ТЦК та СП. [Fullname redacted: Т.Г.Ш.]' },
            {
                input: 'позов Шевченко Т. Г. до Полтавського районного ТЦК та СП',
                expected: 'позов [Fullname redacted: Ш.Т.Г.] до Полтавського районного ТЦК та СП',
            },
            {
                input: "Солов'яненко  М.В.   до  Золочівського  районного  ТЦК",
                expected: '[Fullname redacted: С.М.В.]   до  Золочівського  районного  ТЦК',
            },
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
            'Using SHA-256 hash',
            "Kyiv's Office",
            'Додаток А. Перелік документів',
            '21050, м. Вінниця, вул. Грушевського, 17',
            '[Fullname redacted: Ш.Т.Г.]',
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
