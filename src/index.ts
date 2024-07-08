/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncLocalStorage } from 'node:async_hooks'

import { isObject } from 'lodash'
import pino, { DestinationStream, Logger as PinoLogger, stdSerializers } from 'pino'

import { AlsData, LogData, LogLevel, Logger, LoggerConfig, TrimmerOptions } from '@diia-inhouse/types'

import { defaultOptions } from './config'
import { trimmer } from './trimmer'

export default class DiiaLogger implements Logger {
    private logger: PinoLogger<'io'>

    private trim: ReturnType<typeof trimmer>

    constructor(
        private readonly options: LoggerConfig = {},
        private readonly asyncLocalStorage?: AsyncLocalStorage<AlsData>,
        destinationStream: DestinationStream | null = null,
        existedLogger: PinoLogger<'io'> | null = null,
    ) {
        const trimmerOptions: TrimmerOptions = { ...defaultOptions, ...options }
        const {
            redact: { paths: redactPaths },
        } = trimmerOptions

        this.logger =
            existedLogger ||
            pino(
                {
                    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
                    level: this.options.logLevel ?? LogLevel.INFO,
                    base: undefined,
                    formatters: {
                        level: (l) => ({ level: l.toUpperCase() }),
                    },
                    mixin: () => ({
                        headers: this.asyncLocalStorage?.getStore()?.logData,
                    }),
                    serializers: {
                        err: (value) => {
                            const res = stdSerializers.err(value)
                            if (!isObject(res)) {
                                return res
                            }

                            res.constructorName = res.type
                            res.type = value.type

                            return res
                        },
                    },
                    customLevels: {
                        [LogLevel.IO]: 25,
                    },
                    redact: redactPaths,
                },
                destinationStream || undefined,
            )

        this.trim = trimmer(trimmerOptions, this.logger.isLevelEnabled(LogLevel.DEBUG))
    }

    child(bindings: Record<string, unknown>, destinationStream?: DestinationStream): Logger {
        const pinoLogger = this.logger.child(bindings)

        return new DiiaLogger(this.options, this.asyncLocalStorage, destinationStream, pinoLogger)
    }

    log(message: string, data: unknown = {}): void {
        this.printMessage('info', message, data)
    }

    info(message: string, data: unknown = {}): void {
        this.printMessage('info', message, data)
    }

    io(message: string, data: unknown = {}): void {
        this.printMessage(<pino.Level>'io', message, data)
    }

    error(message: string, data: unknown = {}): void {
        this.printMessage('error', message, data)
    }

    warn(message: string, data: unknown = {}): void {
        this.printMessage('warn', message, data)
    }

    fatal(message: string, data: unknown = {}): void {
        this.printMessage('fatal', message, data)
    }

    trace(message: string, data: unknown = {}): void {
        this.printMessage('trace', message, data)
    }

    debug(message: string, data: unknown = {}): void {
        this.printMessage('debug', message, data)
    }

    prepareContext(context: LogData): LogData {
        return this.trim(context)
    }

    private printMessage(level: pino.Level, message: string, data: any): void {
        const logData = { log: data }
        const trimmedData = this.trim(logData)

        this.logger[level](this.extractPredefinedProperties(trimmedData), message)
    }

    private extractPredefinedProperties(data: any): any {
        if (data.log?.analytics) {
            const { analytics, ...rest } = data.log

            return { analytics, log: rest }
        }

        if (data.log?.err) {
            const { err, ...rest } = data.log

            return { err, log: rest }
        }

        if (data.log instanceof Error) {
            return { err: data.data }
        }

        return data
    }
}

export { DiiaLogger }

export { defaultOptions } from './config'
