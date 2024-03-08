import { TrimmerOptions } from '@diia-inhouse/types'

import { trimmer } from '../../src/trimmer'

describe('trimmer', () => {
    const opts: TrimmerOptions = {
        maxStringLength: 10,
        maxObjectDepth: 1,
        maxArrayLength: 4,
        maxObjectBreadth: 20,
        redact: ['password'],
    }

    it('should return error as is', () => {
        const trim = trimmer(opts)
        const input = new Error('message')

        expect(trim(input)).toEqual(input)
    })
    it('should trim and redact sensitive information from objects', () => {
        const trim = trimmer(opts)

        const obj = {
            name: 'name',
        }

        const shortString = 'short'

        const longString = new Array(100).join('s')

        const num = 10
        const bool = true
        const undef = undefined

        const input = {
            password: 'supersecretpassword',
            func: (): void => {},
            obj,
            shortString,
            longString,
            num,
            bool,
            undef,
        }

        const result = trim(input)

        expect(result).toMatchObject({
            password: '[Redacted]',
            func: '[Function]',
            obj: '[Object]',
            shortString,
            longString: longString.substring(0, opts.maxStringLength) + '...',
            num,
            bool,
            undef,
        })
    })
})
