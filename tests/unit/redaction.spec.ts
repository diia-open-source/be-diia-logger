import { Writable } from 'node:stream'

import { LogLevel } from '@diia-inhouse/types'
import { utils } from '@diia-inhouse/utils'

import { DiiaLogger } from '../../src/index'
import { redactItn } from '../../src/redactors/itn'

describe('DiiaLogger', () => {
    const now = Date.now()
    const serviceVersion = utils.getServiceVersion()

    beforeAll(() => {
        vi.useFakeTimers({ now })
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('should remove fields from log using redact.fields config', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklp'

        const data = {
            inn: '111222333',
            itn: '111222333',
            client: { test: 'some data' },
            firstName: 'First',
            lastName: 'Last',
            middleName: 'Middle',
            passportSeries: 'AA',
            passportNumber: '4548895',
            email: 'test@test.ua',
            addressOfRegistration: 'Kyiv',
            addressOfBirth: 'Kyiv',
            birthDay: '01.01.2020',
            fio: 'Last First Middle',
            passport: 'Passport',
            phone: '+38099123456789',
            address: 'Kyiv',
            birthplace: 'Kyiv',
            fullName: 'Last First',
            phoneNumber: '+38099123456789',
            requestorJWE: token,
            consumerJWE: token,
            refreshToken: {
                value: token,
            },
            token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVVsTkJMVTlCUlZBaUxDSnJhV1FpT2lJek0yVTBZamRqTnkweE1EUTRMVFE0WW1ZdFlqY3pOeTB4WkdGaU1EbGpNRE16WTJJaWZRLmIxc3NGSzY4MkpHOGdaOC1MdlRBQjZHZEFpQmV6Z25fcHdMREpNOHlpM1Ayb2dmZjFHTHNSU3kzcjNKSmFzb0JZVmRlQklQdFFFMzRYQ3o0SEhjTVJSMDRNdHpNYnMtSU5MTl9HNDJxeXBLRGJ6Q3RGdTZqR3I1VUZfUjVrN1E0M1RBUHkzRXo1bnNmWERGd',
            driverLicense: [
                {
                    expiration: '01.03.2025',
                    photo: 'base64 string',
                },
            ],
            ids: ['5e81bcdd86f0b78b1a511634', '5e8c543b97b9439db8098620'],
            _id: '5e81bcdd86f0b78b1a511634',
            file: [
                {
                    name: 'IMG_20200330_092414.jpg',
                    mimeType: 'image/jpeg',
                    contentField:
                        '/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGQAAAwADAAAAAAAAAAAAAAAAAAYHAwUJ/8QAJBAAAQMEAgIDAQEAAAAAAAAAAQIDBAUGBxEAEgghEzFBJGH/2gAIAQEAAD8A5VcOHDjDju2o155Atmz5j7rDFcrEKmuutAFaEPPobUpO/WwFEjfL5krxzw1HplPmY4u+5KX3yFULCnSbpDTrCFxmkrEhAhtFwpUpYSE9Sf8AOYrk8UmKzk/IlHoVwW9aNt48n0+hVCW/Km1JpdReHxdWvjjl5QU608SVNpSjWt/W4dk+wanivIlx43rMyNKnW1Un6ZIfjFXxOONLKSpHYA9SR62AeMnjjfdkYwzDQshX9Q3avT7eL9RjQ0b05UGmVqh99KB6CQGir39A+j9crbvlhjGRYrEaBhWJRq/b9+wb5pTSapLmxp8nf9okqecJSFJaYCQkH7UfX7oleaV4026LxvGxbQo9n1a7GGYQk0d15pyLGEoyXtr7dnn3lnS33CVhOwnqDoSDKuQJ2Vsk3LkqpwGIUu5qm/U3o7CiptpbqyopSVeyBv8AeKvDhw5//9k=',
                    size: 788626,
                },
            ],
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            {},
            undefined,
            new Writable({
                write: (chunk: Buffer, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = {
                        level: 'ERROR',
                        timestamp: currentDataIsoString,
                        serviceVersion,
                        log: {
                            data: {
                                inn: '[Redacted]',
                                itn: '[Redacted]',
                                client: '[Redacted]',
                                firstName: '[Redacted]',
                                lastName: '[Redacted]',
                                middleName: '[Redacted]',
                                passportSeries: '[Redacted]',
                                passportNumber: '[Redacted]',
                                email: '[Redacted]',
                                addressOfRegistration: '[Redacted]',
                                addressOfBirth: '[Redacted]',
                                birthDay: '[Redacted]',
                                fio: '[Redacted]',
                                passport: '[Redacted]',
                                phone: '[Redacted]',
                                address: '[Redacted]',
                                birthplace: '[Redacted]',
                                fullName: '[Redacted]',
                                phoneNumber: '[Redacted]',
                                requestorJWE: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklp',
                                consumerJWE: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklp',
                                refreshToken: '[Redacted]',
                                token: '[Redacted]',
                                driverLicense: [
                                    {
                                        expiration: '01.03.2025',
                                        photo: '[Redacted]',
                                    },
                                ],
                                ids: ['5e81bcdd86f0b78b1a511634', '5e8c543b97b9439db8098620'],
                                _id: '5e81bcdd86f0b78b1a511634',
                                file: [
                                    {
                                        name: 'IMG_20200330_092414.jpg',
                                        mimeType: 'image/jpeg',
                                        contentField:
                                            '/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGQAAAwADAAAAAAAAAAAAAAAAAAYHAwUJ/8QAJBAAAQMEAgIDAQEAAAAAAAAAAQIDBAUGBxEAEgghEzFBJGH/2gAIAQEAAD8A5VcOHDjDj...vDhw5//9k= (688 chars)',
                                        size: 788626,
                                    },
                                ],
                            },
                        },
                        msg: 'error message',
                    }

                    expect(loggerResult).toBe(JSON.stringify(expected))

                    cb()
                },
            }),
        )

        logger.error('error message', { data })
    })

    it('should not redact field if value is absent', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const data = {
            itn: '111222333',
            inn: '',
            rnokpp: undefined,
            firstName: null,
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            {},
            undefined,
            new Writable({
                write: (chunk: Buffer, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"ERROR","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"data":{"itn":"[Redacted]","inn":"","firstName":null}},"msg":"error message"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.error('error message', { data })
    })

    describe('redact config', () => {
        const cases = [
            {
                message: 'should redact fullnames and itn if fields presented in the redact config',
                inputData: {
                    value: 'раз Шевченко Тарас Григорович два',
                    name: 'Головне управління Пенсійного фонду України в Дніпропетровській області',
                    title: 'три Шевченко Тарас Григорович-Кобзар чотири',
                    label: '1234567890',
                    text: [
                        "п'ять Шевченко Тарас Григорович шість",
                        'Основне управління Освітнього фонду України в Київській області',
                        'сім Шевченко Тарас Григорович-Кобзар вісім',
                    ],
                },
                expectedLogData:
                    '{"value":"раз [Fullname redacted: Ш.Т.Г.] два","name":"Головне управління Пенсійного фонду України в Дніпропетровській області","title":"три [Fullname redacted: Ш.Т.Г.] чотири","label":"12[...itn redacted...]90","text":["п\'ять [Fullname redacted: Ш.Т.Г.] шість","Основне управління Освітнього фонду України в Київській області","сім [Fullname redacted: Ш.Т.Г.] вісім"]}',
            },
            {
                message: 'should apply full name and itn redaction on the same string field',
                inputData: {
                    label: 'Шевченко Тарас Григорович, рнокпп: 1234567890',
                },
                expectedLogData: '{"label":"[Fullname redacted: Ш.Т.Г.] рнокпп: 12[...itn redacted...]90"}',
            },
            {
                message: 'should apply full name and itn redaction on the same array of strings field',
                inputData: {
                    label: ['Шевченко Тарас Григорович, рнокпп: 1234567890', 'Шевченко Тарас Григорович', 'valid text', '1234567890'],
                },
                expectedLogData:
                    '{"label":["[Fullname redacted: Ш.Т.Г.] рнокпп: 12[...itn redacted...]90","[Fullname redacted: Ш.Т.Г.] ","valid text","12[...itn redacted...]90"]}',
            },
        ]

        it.each(cases)('$message', async (params) => {
            const { inputData, expectedLogData } = params
            const currentDate = Date.now()
            const currentDataIsoString = new Date(currentDate).toISOString()

            vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

            expect.assertions(1)
            const logger = new DiiaLogger(
                {},
                undefined,
                new Writable({
                    write: (chunk: Buffer, _: unknown, cb: () => void): void => {
                        const loggerResult = chunk.toString().trim()
                        const expected = `{"level":"ERROR","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"data":${expectedLogData}},"msg":"error message"}`

                        expect(loggerResult).toBe(expected)

                        cb()
                    },
                }),
            )

            logger.error('error message', { data: inputData })
        })
    })

    it('should handle documents array with objects without transforming them to empty strings', () => {
        const currentDate = Date.now()

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const data = {
            documents: [
                { name: 'passport.pdf', size: 1234, type: 'document' },
                {
                    name: 'license.pdf',
                    size: 5678,
                    type: 'document',
                    itn: '1234567890',
                    documents: {
                        itn: '1234567890',
                    },
                },
            ],
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            {},
            undefined,
            new Writable({
                write: (chunk: Buffer, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const parsed = JSON.parse(loggerResult)

                    expect(parsed.log.data.documents).toEqual([
                        { name: 'passport.pdf', size: 1234, type: 'document' },
                        {
                            name: 'license.pdf',
                            size: 5678,
                            type: 'document',
                            itn: '[Redacted]',
                            documents: {
                                itn: '[Redacted]',
                            },
                        },
                    ])

                    cb()
                },
            }),
        )

        logger.error('error message', { data })
    })

    it('should not redact values if log level is debug or below', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const data = {
            value: 'раз Шевченко Тарас Григорович два',
            name: 'Головне управління Пенсійного фонду України в Дніпропетровській області',
            title: 'три Шевченко Тарас Григорович-Кобзар чотири',
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            { logLevel: LogLevel.DEBUG },
            undefined,
            new Writable({
                write: (chunk: Buffer, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"DEBUG","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"data":{"value":"раз Шевченко Тарас Григорович два","name":"Головне управління Пенсійного фонду України в Дніпропетровській області","title":"три Шевченко Тарас Григорович-Кобзар чотири"}},"msg":"error message"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.debug('error message', { data })
    })

    describe('redaction of itn', () => {
        const testCases = [
            // Basic cases
            {
                name: 'Entire string is 10 digits',
                input: '1234567890',
                expected: '12[...itn redacted...]90',
            },
            {
                name: 'Empty string',
                input: '',
                expected: '',
            },
            {
                name: 'String too short',
                input: '123456789',
                expected: '123456789',
            },
            {
                name: 'No digits',
                input: 'hello world',
                expected: 'hello world',
            },

            // Valid boundary cases
            {
                name: 'Wrapped in single quotes',
                input: "'1234567890'",
                expected: "'12[...itn redacted...]90'",
            },
            {
                name: 'Wrapped in double quotes',
                input: '"1234567890"',
                expected: '"12[...itn redacted...]90"',
            },
            {
                name: 'Wrapped in parentheses',
                input: '(1234567890)',
                expected: '(12[...itn redacted...]90)',
            },
            {
                name: 'Wrapped in brackets',
                input: '[1234567890]',
                expected: '[12[...itn redacted...]90]',
            },
            {
                name: 'Wrapped in braces',
                input: '{1234567890}',
                expected: '{12[...itn redacted...]90}',
            },
            {
                name: 'Wrapped in spaces',
                input: ' 1234567890 ',
                expected: ' 12[...itn redacted...]90 ',
            },
            {
                name: 'At start with delimiter',
                input: '1234567890,next',
                expected: '12[...itn redacted...]90,next',
            },
            {
                name: 'At end with delimiter',
                input: 'prev:1234567890',
                expected: 'prev:12[...itn redacted...]90',
            },
            {
                name: 'Multiple delimiters',
                input: 'data: 1234567890; end',
                expected: 'data: 12[...itn redacted...]90; end',
            },

            // Invalid boundary cases (should not be redacted)
            {
                name: 'Wrapped in letters',
                input: 'abc1234567890def',
                expected: 'abc1234567890def',
            },
            {
                name: 'Mixed with letters at start',
                input: 'phone1234567890',
                expected: 'phone1234567890',
            },
            {
                name: 'Mixed with letters at end',
                input: '1234567890number',
                expected: '1234567890number',
            },
            {
                name: 'Mixed with letters on both sides',
                input: 'call1234567890now',
                expected: 'call1234567890now',
            },

            // Wrong digit count cases
            {
                name: '9 digits with valid boundaries',
                input: ' 123456789 ',
                expected: ' 123456789 ',
            },
            {
                name: '11 digits with valid boundaries',
                input: ' 12345678901 ',
                expected: ' 12345678901 ',
            },
            {
                name: '12 digits with valid boundaries',
                input: '(123456789012)',
                expected: '(123456789012)',
            },

            // Separator cases (should not be redacted)
            {
                name: 'Digits with dash separator',
                input: '12345-67890',
                expected: '12345-67890',
            },
            {
                name: 'Digits with space separator',
                input: '12345 67890',
                expected: '12345 67890',
            },
            {
                name: 'Digits with dot separator',
                input: '12345.67890',
                expected: '12345.67890',
            },
            {
                name: 'Phone format with parentheses',
                input: '(123) 456-7890',
                expected: '(123) 456-7890',
            },

            // Multiple sequences
            {
                name: 'Two valid sequences',
                input: 'Call 1234567890 or 0987654321',
                expected: 'Call 12[...itn redacted...]90 or 09[...itn redacted...]21',
            },
            {
                name: 'Three valid sequences',
                input: '1234567890, 5555555555, 9999999999',
                expected: '12[...itn redacted...]90, 55[...itn redacted...]55, 99[...itn redacted...]99',
            },
            {
                name: 'Mix of valid and invalid sequences',
                input: 'Valid: 1234567890, Invalid: phone5555555555end',
                expected: 'Valid: 12[...itn redacted...]90, Invalid: phone5555555555end',
            },

            // Edge cases with positioning
            {
                name: 'Sequence at very beginning',
                input: '1234567890 is my number',
                expected: '12[...itn redacted...]90 is my number',
            },
            {
                name: 'Sequence at very end',
                input: 'My number is 1234567890',
                expected: 'My number is 12[...itn redacted...]90',
            },
            {
                name: 'Only digits and delimiters',
                input: '1234567890;0987654321',
                expected: '12[...itn redacted...]90;09[...itn redacted...]21',
            },

            // Complex boundary scenarios
            {
                name: 'Nested delimiters',
                input: '((1234567890))',
                expected: '((12[...itn redacted...]90))',
            },
            {
                name: 'Mixed delimiters',
                input: '"Call: 1234567890!"',
                expected: '"Call: 12[...itn redacted...]90!"',
            },
            {
                name: 'Tab and newline delimiters',
                input: '\t1234567890\n',
                expected: '\t12[...itn redacted...]90\n',
            },

            // Stress test cases
            {
                name: 'Very long string with multiple sequences',
                input: 'Here are some numbers: 1111111111, then text, then 2222222222, more text, and finally 3333333333.',
                expected:
                    'Here are some numbers: 11[...itn redacted...]11, then text, then 22[...itn redacted...]22, more text, and finally 33[...itn redacted...]33.',
            },
            {
                name: 'Consecutive invalid sequences',
                input: 'abc1234567890def2222222222ghi',
                expected: 'abc1234567890def2222222222ghi',
            },
        ]

        it.each(testCases)('should redact itn when input is %s', ({ input, expected }) => {
            const result = redactItn(input)

            expect(result).toBe(expected)
        })
    })
})
