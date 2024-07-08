import { Writable } from 'node:stream'

import { LogLevel } from '@diia-inhouse/types'

import DiiaLogger from '../../src/index'

describe('DiiaLogger', () => {
    const now = Date.now()

    beforeAll(() => {
        jest.useFakeTimers({ now })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should remove fields from log using redact.fields config', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

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
                    content:
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
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = {
                        level: 'ERROR',
                        timestamp: `${currentDataIsoString}`,
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
                                        content:
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

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

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
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"ERROR","timestamp":"${currentDataIsoString}","log":{"data":{"itn":"[Redacted]","inn":"","firstName":null}},"msg":"error message"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.error('error message', { data })
    })

    it('should redact fullnames if a field presented in the redact.fieldsToRedactFullname config', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const data = {
            value: 'раз Шевченко Тарас Григорович два',
            name: 'Головне управління Пенсійного фонду України в Дніпропетровській області',
            title: 'три Шевченко Тарас Григорович-Кобзар чотири',
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            {},
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"ERROR","timestamp":"${currentDataIsoString}","log":{"data":{"value":"раз [Fullname redacted: Ш.Т.Г.] два","name":"Головне управління Пенсійного фонду України в Дніпропетровській області","title":"три [Fullname redacted: Ш.Т.Г.] чотири"}},"msg":"error message"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.error('error message', { data })
    })

    it('should not redact values if log level is debug or below', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

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
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"DEBUG","timestamp":"${currentDataIsoString}","log":{"data":{"value":"раз Шевченко Тарас Григорович два","name":"Головне управління Пенсійного фонду України в Дніпропетровській області","title":"три Шевченко Тарас Григорович-Кобзар чотири"}},"msg":"error message"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.debug('error message', { data })
    })
})
