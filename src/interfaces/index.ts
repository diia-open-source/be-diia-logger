import { LoggerOptions } from '@diia-inhouse/types'

export interface InternalLoggerOptions extends Required<Omit<LoggerOptions, 'redact'>> {
    redact: {
        fields: Set<string>
        paths: Set<string>
        fieldsToRedactFullname: Set<string>
        fieldsToRedactItn: Set<string>
    }
}
