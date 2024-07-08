import { Writable } from 'node:stream'

import { LogLevel, LoggerConfig } from '@diia-inhouse/types'

import DiiaLogger from '../../src/index'

const config: LoggerConfig = {
    logLevel: LogLevel.DEBUG,
    maxObjectDepth: 5,
}

describe('DiiaLogger', () => {
    const now = Date.now()

    beforeAll(() => {
        jest.useFakeTimers({ now })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should log basic object with message', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

        expect.assertions(1)
        const logger = new DiiaLogger(
            config,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"hello"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.log('hello', { analytics: { appVersion: '1.0.10' } })
    })

    it('should log nested object correctly', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const nestedObject = {
            key1: {
                key11: {
                    key111: {
                        value: 'val text',
                    },
                },
            },
            key2: {
                key22: {
                    key222: {
                        key2222: {
                            key22222: {
                                value: 'val text',
                            },
                        },
                    },
                },
            },
            key3: {
                key33: 'value 33',
            },
            key4: 'value 4',
        }

        expect.assertions(1)
        const logger = new DiiaLogger(
            config,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","log":{"nestedObject":{"key1":{"key11":{"key111":"[Object]"}},"key2":{"key22":{"key222":"[Object]"}},"key3":{"key33":"value 33"},"key4":"value 4"}},"msg":"nested object"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.log('nested object', { nestedObject })
    })

    it('should log Date correctly', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const date = new Date()

        expect.assertions(1)
        const logger = new DiiaLogger(
            config,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","log":{"date":"${new Date(
                        date,
                    ).toISOString()}"},"msg":"log with date"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.log('log with date', { date })
    })

    it('should log array correctly', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        jest.spyOn(Date, 'now').mockImplementation(() => currentDate)

        expect.assertions(1)
        const logger = new DiiaLogger(
            config,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","log":{"arr":[1,2,3,4,{"someObject":{"value":true}}]},"msg":"log with array"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.log('log with array', { arr: [1, 2, 3, 4, { someObject: { value: true } }] })
    })

    it('should write correct logs in case io level is configured', () => {
        const write = jest.fn()
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()
        const logger = new DiiaLogger(
            { logLevel: LogLevel.IO },
            undefined,
            new Writable({
                write,
            }),
        )
        const expectedLogLevelsToBeShown = [LogLevel.INFO, LogLevel.ERROR, LogLevel.FATAL, LogLevel.WARN, LogLevel.IO]

        for (const logLevel of expectedLogLevelsToBeShown) {
            write.mockImplementationOnce((chunk: string, _: unknown, cb: () => void) => {
                const loggerResult = chunk.toString().trim()
                const expected = `{"level":"${logLevel.toUpperCase()}","timestamp":"${currentDataIsoString}","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"${logLevel}"}`

                expect(loggerResult).toBe(expected)

                cb()
            })
        }

        logger.info('info', { analytics: { appVersion: '1.0.10' } })
        logger.debug('debug', { analytics: { appVersion: '1.0.10' } })
        logger.trace('trace', { analytics: { appVersion: '1.0.10' } })
        logger.error('error', { analytics: { appVersion: '1.0.10' } })
        logger.fatal('fatal', { analytics: { appVersion: '1.0.10' } })
        logger.warn('warn', { analytics: { appVersion: '1.0.10' } })
        logger.io('io', { analytics: { appVersion: '1.0.10' } })

        expect(write).toHaveBeenCalledTimes(expectedLogLevelsToBeShown.length)
    })
})
