/* oxlint-disable typescript/no-explicit-any */
import lodash from 'lodash'

import { LoggerOptions } from '@diia-inhouse/types'

import { toInternalLoggerOptions } from './config.js'
import { InternalLoggerOptions } from './interfaces/index.js'
import { redactFullName } from './redactors/fullName.js'
import { redactItn } from './redactors/itn.js'

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

function trimObject(opts: InternalLoggerOptions, node: object, depth: number, isRedactionDisabled: boolean): object {
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
            if (isRedactionDisabled) {
                output[key] = trimWalker(opts, value, depth + 1, isRedactionDisabled)
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

            output[key] = trimWalker(opts, value, depth + 1, isRedactionDisabled)

            if (typeof value === 'string' || Array.isArray(value)) {
                if (opts.redact.fieldsToRedactFullname?.has(key)) {
                    output[key] = redactionWalker(opts, key, output[key], isRedactionDisabled)
                }

                if (opts.redact.fieldsToRedactItn?.has(key)) {
                    output[key] = redactionWalker(opts, key, output[key], isRedactionDisabled)
                }

                continue
            }
        }

        return output
    }

    return node
}

const trimWalker = (opts: InternalLoggerOptions, node: any, depth: number, isRedactionDisabled: boolean): any => {
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
        return trimObject(opts, node, depth, isRedactionDisabled)
    }

    return node
}

// oxlint-disable-next-line oxc/only-used-in-recursion
const redactionWalker = (opts: InternalLoggerOptions, key: string, value: string | any[], isRedactionDisabled: boolean): string | any[] => {
    if (Array.isArray(value)) {
        return value.map((item) => redactionWalker(opts, key, item, isRedactionDisabled))
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

    return value
}

export const trimmer = (opts: InternalLoggerOptions, isRedactionDisabled: boolean): ((i: unknown) => any) => {
    return (input: unknown): any => {
        try {
            return trimWalker(opts, input, 0, isRedactionDisabled)
        } catch (err) {
            return { err, msg: 'Failed to trim logger input' }
        }
    }
}

export const createTrimmer = (options: LoggerOptions = {}, isRedactionDisabled = false): ((i: unknown) => any) =>
    trimmer(toInternalLoggerOptions(options), isRedactionDisabled)
