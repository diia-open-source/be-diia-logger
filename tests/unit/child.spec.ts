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

    it('should log from a child with bindings', () => {
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
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","childProp":"childValue","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"hello"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )
        const child = logger.child({ childProp: 'childValue' })

        child.info('hello', { analytics: { appVersion: '1.0.10' } })
    })
})
