import { Writable } from 'node:stream'

import { LogLevel, LoggerOptions } from '@diia-inhouse/types'
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

    it('should log from a child with bindings', () => {
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
                    const expected = `{"level":"INFO","timestamp":"${currentDataIsoString}","childProp":"childValue","serviceVersion":"${serviceVersion}","analytics":{"appVersion":"1.0.10"},"log":{},"msg":"hello"}`

                    expect(loggerResult).toBe(expected)

                    cb()
                },
            }),
        )
        const child = logger.child({ childProp: 'childValue' })

        child.info('hello', { analytics: { appVersion: '1.0.10' } })
    })
})
