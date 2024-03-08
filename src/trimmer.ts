/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'bson'
import { isObject } from 'lodash'

import { TrimmerOptions } from '@diia-inhouse/types'

const walker = (opts: TrimmerOptions, node: any, depth: number): any => {
    if (node instanceof Error) {
        return node
    }

    if (typeof node === 'string') {
        return node.length > opts.maxStringLength ? `${node.substring(0, opts.maxStringLength)}...` : node
    }

    if (typeof node === 'number' || typeof node === 'boolean' || typeof node === 'undefined' || node === null) {
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
    }

    if (isObject(node)) {
        const keys = Object.getOwnPropertyNames(node)

        if (keys.length) {
            const output: Record<string, any> = Array.isArray(node) ? [] : {}

            Object.entries(node).forEach(([key, value]) => {
                if (!value) {
                    output[key] = value
                } else {
                    output[key] = opts.redact.includes(key) ? '[Redacted]' : walker(opts, value, depth + 1)
                }
            })

            return output
        }

        return node
    }

    return node
}

export const trimmer = (opts: TrimmerOptions): ((i: unknown) => any) => {
    return (input: unknown): any => {
        return walker(opts, input, 0)
    }
}
