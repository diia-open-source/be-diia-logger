/* oxlint-disable typescript/no-explicit-any */
import lodash from 'lodash'

import { LoggerOptions } from '@diia-inhouse/types'

import { toInternalLoggerOptions } from './config.js'
import { InternalLoggerOptions } from './interfaces/index.js'
import { redactEmail } from './redactors/email.js'
import { redactFullName } from './redactors/fullName.js'
import { redactItn } from './redactors/itn.js'
import { redactPhone } from './redactors/phone.js'

// oxlint-disable-next-line typescript/unbound-method
const { isObject } = lodash

function trimString(str: string, { maxStringLength, endLengthToLog }: InternalLoggerOptions): string {
    const length = str.length
    const truncatedString =
        length > maxStringLength
            ? `${str.slice(0, maxStringLength - endLengthToLog)}...${str.slice(0 - endLengthToLog)} (${length} chars)`
            : str

    return truncatedString
}

function trimObject(opts: InternalLoggerOptions, node: object, depth: number): object {
    const propertiesCount = Object.keys(node).length
    if (propertiesCount > opts.maxObjectBreadth) {
        const visibleObjectProperties = Object.entries(node).slice(0, opts.maxObjectBreadth)

        visibleObjectProperties.push(['...', `${propertiesCount - opts.maxObjectBreadth} more properties`])

        return Object.fromEntries(visibleObjectProperties)
    }

    const keys = Object.getOwnPropertyNames(node)
    if (keys.length > 0) {
        const output: Record<string, any> = Array.isArray(node) ? [] : {}

        for (const [key, value] of Object.entries(node)) {
            if (opts.redactDisabled) {
                output[key] = trimWalker(opts, value, depth + 1)
                continue
            }

            if (!value) {
                output[key] = value
                continue
            }

            if (opts.redact.fields?.has(key)) {
                output[key] = '[Redacted]'
                continue
            }

            output[key] = trimWalker(opts, value, depth + 1)

            if (typeof value === 'string' || Array.isArray(value)) {
                if (opts.redact.fieldsToScan.has(key)) {
                    output[key] = redactionWalker(opts, key, output[key])
                }

                continue
            }
        }

        return output
    }

    return node
}

const trimWalker = (opts: InternalLoggerOptions, node: any, depth: number): any => {
    if (node instanceof Error) {
        return node
    }

    if (typeof node === 'string') {
        return trimString(node, opts)
    }

    if (typeof node === 'number' || typeof node === 'boolean' || node === undefined || node === null) {
        return node
    }

    if (typeof node === 'function') {
        return '[Function]'
    }

    if (depth >= opts.maxObjectDepth) {
        return '[Object]'
    }

    if (Buffer.isBuffer(node)) {
        return `Buffer(${node.length})`
    }

    if (Array.isArray(node) && node.length > opts.maxArrayLength) {
        const itemsAboveLimit: number = node.length - opts.maxArrayLength

        return node.slice(0, opts.maxArrayLength).concat(`... and ${itemsAboveLimit} more items`)
    }

    if (node?.['_bsontype'] === 'ObjectId') {
        return node.toString()
    }

    if (node instanceof Date) {
        return node
    }

    if (isObject(node)) {
        return trimObject(opts, node, depth)
    }

    return node
}

const redactionWalker = (opts: InternalLoggerOptions, key: string, value: string | any[]): string | any[] => {
    if (Array.isArray(value)) {
        return value.map((item) => redactionWalker(opts, key, item))
    }

    if (typeof value !== 'string') {
        return value
    }

    if (opts.redact.fieldsToRedactFullname?.has(key)) {
        value = redactFullName(value)
    }

    if (opts.redact.fieldsToRedactItn?.has(key)) {
        value = redactItn(value)
    }

    if (opts.redact.fieldsToRedactEmail?.has(key)) {
        value = redactEmail(value)
    }

    if (opts.redact.fieldsToRedactPhone?.has(key)) {
        value = redactPhone(value)
    }

    return value
}

export const trimmer = (opts: InternalLoggerOptions): ((i: unknown) => any) => {
    return (input: unknown): any => {
        try {
            return trimWalker(opts, input, 0)
        } catch (err) {
            return { err, msg: 'Failed to trim logger input' }
        }
    }
}

export const createTrimmer = (options: LoggerOptions = {}): ((i: unknown) => any) => trimmer(toInternalLoggerOptions(options))
