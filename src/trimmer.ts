/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'bson'
import { isObject } from 'lodash'

import { TrimmerOptions } from '@diia-inhouse/types'

function redactFullName(text: string): string {
    // eslint-disable-next-line unicorn/better-regex
    const fullNameRegex = /(?:^|\s)(?<fullname>[А-ЯҐЄІЇA-Z][а-яґєіїa-z]+(?:(\s|-)[А-ЯҐЄІЇA-Z][а-яґєіїa-z-]+)+)(?:\s|$)/g

    return text.replaceAll(fullNameRegex, (match, ...args) => {
        const fullname: string = args.at(-1)?.fullname

        if (!fullname) {
            return match
        }

        return ` [Fullname redacted: ${fullname
            .split(' ')
            .map((part) => part[0])
            .join('.')}.] `
    })
}

function formatString(str: string, { maxStringLength, endLengthToLog }: TrimmerOptions): string {
    const length = str.length
    const truncatedString =
        length > maxStringLength
            ? `${str.slice(0, maxStringLength - endLengthToLog)}...${str.slice(0 - endLengthToLog)} (${length} chars)`
            : str

    return truncatedString
}

const walker = (opts: TrimmerOptions, node: any, depth: number, isRedactionDisabled: boolean): any => {
    if (node instanceof Error) {
        return node
    }

    if (typeof node === 'string') {
        return formatString(node, opts)
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

    if (ObjectId.isValid(node)) {
        return node.toString()
    }

    if (isObject(node)) {
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
                    output[key] = walker(opts, value, depth + 1, isRedactionDisabled)
                    continue
                }

                if (!value) {
                    output[key] = value
                    continue
                }

                if (opts.redact.fields?.includes(key)) {
                    output[key] = '[Redacted]'
                    continue
                }

                if (typeof value === 'string' && opts.redact.fieldsToRedactFullname?.includes(key)) {
                    output[key] = redactFullName(value)
                    continue
                }

                output[key] = walker(opts, value, depth + 1, isRedactionDisabled)
            }

            return output
        }

        return node
    }

    return node
}

export const trimmer = (opts: TrimmerOptions, isRedactionDisabled: boolean): ((i: unknown) => any) => {
    return (input: unknown): any => {
        return walker(opts, input, 0, isRedactionDisabled)
    }
}
