import { AsyncLocalStorage } from 'node:async_hooks'
import { Writable } from 'node:stream'

import { SpanContext, TraceFlags, trace } from '@opentelemetry/api'

import { AlsData, LogLevel, LoggerOptions } from '@diia-inhouse/types'
import { utils } from '@diia-inhouse/utils'

import DiiaLogger from '../../src/index'

const options: LoggerOptions = {
    logLevel: LogLevel.DEBUG,
    maxObjectDepth: 5,
}

describe('DiiaLogger', () => {
    const now = Date.now()
    const serviceVersion = utils.getServiceVersion()

    beforeAll(() => {
        vi.useFakeTimers({ now })
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('should log basic object with message', () => {
        const currentDate = Date.now()
        const currentDataIsoString = new Date(currentDate).toISOString()

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        expect.assertions(1)
        const logger = new DiiaLogger(
            options,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"hello"}`

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

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

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
            options,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"nestedObject":{"key1":{"key11":{"key111":"[Object]"}},"key2":{"key22":{"key222":"[Object]"}},"key3":{"key33":"value 33"},"key4":"value 4"}},"msg":"nested object"}`

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

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        const date = new Date()

        expect.assertions(1)
        const logger = new DiiaLogger(
            options,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"date":"${new Date(
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

        vi.spyOn(Date, 'now').mockImplementation(() => currentDate)

        expect.assertions(1)
        const logger = new DiiaLogger(
            options,
            undefined,
            new Writable({
                write: (chunk: string, _: unknown, cb: () => void): void => {
                    const loggerResult = chunk.toString().trim()
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","log":{"arr":[1,2,3,4,{"someObject":{"value":true}}]},"msg":"log with array"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )

        logger.log('log with array', { arr: [1, 2, 3, 4, { someObject: { value: true } }] })
    })

    it('should write correct logs in case io level is configured', () => {
        const write = vi.fn()
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
                const expected = `{"level":"${logLevel.toUpperCase()}","timestamp":"${currentDataIsoString}","serviceVersion":"${serviceVersion}","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"${logLevel}"}`

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

    describe('OpenTelemetry span enrichment', () => {
        const spanContext: SpanContext = {
            traceId: '0af7651916cd43dd8448eb211c80319c',
            spanId: 'b7ad6b7169203331',
            traceFlags: TraceFlags.SAMPLED,
        }

        it('adds spanId from the active span into headers', () => {
            vi.spyOn(trace, 'getSpan').mockReturnValue(trace.wrapSpanContext(spanContext))

            expect.assertions(2)
            const logger = new DiiaLogger(
                options,
                undefined,
                new Writable({
                    write: (chunk: string, _: unknown, cb: () => void): void => {
                        const parsed = JSON.parse(chunk.toString().trim())

                        expect(parsed.headers).toEqual({ spanId: 'b7ad6b7169203331' })
                        expect(parsed.msg).toBe('hello')

                        cb()
                    },
                }),
            )

            logger.log('hello')
        })

        it('merges spanId with existing AsyncLocalStorage logData', () => {
            vi.spyOn(trace, 'getSpan').mockReturnValue(trace.wrapSpanContext(spanContext))

            const asyncLocalStorage = new AsyncLocalStorage<AlsData>()

            expect.assertions(1)
            const logger = new DiiaLogger(
                options,
                asyncLocalStorage,
                new Writable({
                    write: (chunk: string, _: unknown, cb: () => void): void => {
                        const parsed = JSON.parse(chunk.toString().trim())

                        expect(parsed.headers).toEqual({
                            traceId: '0af7651916cd43dd8448eb211c80319c',
                            spanId: 'b7ad6b7169203331',
                        })

                        cb()
                    },
                }),
            )

            asyncLocalStorage.run({ logData: { traceId: '0af7651916cd43dd8448eb211c80319c' } }, () => {
                logger.log('hello')
            })
        })

        it('omits spanId when no span is active', () => {
            vi.spyOn(trace, 'getSpan').mockReturnValue()

            expect.assertions(1)
            const logger = new DiiaLogger(
                options,
                undefined,
                new Writable({
                    write: (chunk: string, _: unknown, cb: () => void): void => {
                        const parsed = JSON.parse(chunk.toString().trim())

                        expect(parsed).not.toHaveProperty('headers')

                        cb()
                    },
                }),
            )

            logger.log('hello')
        })
    })
})
