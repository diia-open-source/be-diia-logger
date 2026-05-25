import { LogLevel } from '@diia-inhouse/types'

import { InternalLoggerOptions } from '../../src/interfaces'
import { trimmer } from '../../src/trimmer'

describe('trimmer', () => {
    const opts: InternalLoggerOptions = {
        logLevel: LogLevel.INFO,
        maxStringLength: 20,
        maxObjectDepth: 2,
        maxArrayLength: 4,
        maxObjectBreadth: 20,
        redactDisabled: false,
        redact: {
            fields: new Set(['password']),
            paths: new Set(),
            fieldsToRedactFullname: new Set(),
            fieldsToRedactItn: new Set(),
        },
        endLengthToLog: 5,
    }

    it('should return error as is', () => {
        const trim = trimmer(opts)
        const input = new Error('message')

        expect(trim(input)).toEqual(input)
    })

    it('should not treat plain objects with ObjectId-like id as ObjectId', () => {
        const trim = trimmer(opts)
        const params = { id: '507f1f77bcf86cd799439011', bucket: 'diia-private' }

        const result = trim(params)

        expect(result).toEqual(expect.objectContaining({ bucket: 'diia-private' }))
        expect(typeof result.id).toBe('string')
        expect(result.id).toContain('507f1f77bcf86cd')
        expect(result.id).not.toBe('[object Object]')
    })

    it('should trim and redact sensitive information from objects', () => {
        const trim = trimmer(opts)

        const obj = {
            name: 'name',
        }

        const shortString = 'short'

        const longString = Array.from({ length: 10 }).join('0123456789')

        const num = 10
        const bool = true
        const undef = undefined
        const buffer = Buffer.from('buffer')

        const input = {
            password: 'supersecretpassword',
            func: (): void => {},
            obj,
            shortString,
            longString,
            num,
            bool,
            undef,
            buffer,
        }

        const result = trim(input)

        expect(result).toMatchObject({
            password: '[Redacted]',
            func: '[Function]',
            obj,
            shortString,
            longString: '012345678901234...56789 (90 chars)',
            num,
            bool,
            undef,
            buffer: `Buffer(${buffer.length})`,
        })
    })
})
