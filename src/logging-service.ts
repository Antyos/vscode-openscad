import { window } from 'vscode';

const LOG_LEVEL = {
    DEBUG: 'Debug',
    INFO: 'Info',
    WARN: 'Warn',
    ERROR: 'Error',
    NONE: 'None',
} as const;

type ObjectValues<T> = T[keyof T];

export type LogLevel = ObjectValues<typeof LOG_LEVEL>;

export class LoggingService {
    private outputChannel = window.createOutputChannel('OpenSCAD');
    private logLevel: LogLevel = LOG_LEVEL.INFO;

    public setOutputLevel(logLevel: LogLevel) {
        this.logLevel = logLevel;
    }

    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    public logDebug(message: string, data?: unknown): void {
        if (
            this.logLevel === LOG_LEVEL.NONE ||
            this.logLevel === LOG_LEVEL.INFO ||
            this.logLevel === LOG_LEVEL.WARN ||
            this.logLevel === LOG_LEVEL.ERROR
        ) {
            return;
        }
        this.logMessage(message, LOG_LEVEL.DEBUG);
        if (data) {
            this.logObject(data);
        }
    }

    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    public logInfo(message: string, data?: unknown): void {
        if (
            this.logLevel === LOG_LEVEL.NONE ||
            this.logLevel === LOG_LEVEL.WARN ||
            this.logLevel === LOG_LEVEL.ERROR
        ) {
            return;
        }
        this.logMessage(message, LOG_LEVEL.INFO);
        if (data) {
            this.logObject(data);
        }
    }

    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    public logWarning(message: string, data?: unknown): void {
        if (
            this.logLevel === LOG_LEVEL.NONE ||
            this.logLevel === LOG_LEVEL.ERROR
        ) {
            return;
        }
        this.logMessage(message, LOG_LEVEL.WARN);
        if (data) {
            this.logObject(data);
        }
    }

    public logError(message: string, error?: unknown) {
        if (this.logLevel === LOG_LEVEL.NONE) {
            return;
        }
        this.logMessage(message, LOG_LEVEL.ERROR);
        if (typeof error === 'string') {
            // Errors as a string usually only happen with
            // plugins that don't return the expected error.
            this.outputChannel.appendLine(error);
        } else if (error instanceof Error) {
            if (error?.message) {
                this.logMessage(error.message, LOG_LEVEL.ERROR);
            }
            if (error?.stack) {
                this.outputChannel.appendLine(error.stack);
            }
        } else if (error) {
            this.logObject(error);
        }
    }

    public show() {
        this.outputChannel.show();
    }

    private logObject(data: unknown): void {
        // const message = JSON.parser
        //   .format(JSON.stringify(data, null, 2), {
        //     parser: "json",
        //   })
        //   .trim();
        const message = JSON.stringify(data, undefined, 4);

        this.outputChannel.appendLine(message);
    }

    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    private logMessage(message: string, logLevel: LogLevel): void {
        const title = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`["${logLevel}" - ${title}] ${message}`);
    }
}
