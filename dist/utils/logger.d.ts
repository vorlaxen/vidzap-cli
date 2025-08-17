declare class Logger {
    static info(message: string): void;
    static success(message: string): void;
    static warn(message: string): void;
    static error(message: string, error?: unknown): void;
    static debug(message: string): void;
}
export default Logger;
