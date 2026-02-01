export const logger = {
    info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
    error: (objOrMsg: any, msg?: string, ...args: any[]) => {
        if (typeof objOrMsg === 'string') {
            console.error(`[ERROR] ${objOrMsg}`, msg || '', ...args);
        } else {
            console.error(`[ERROR] ${msg || ''}`, objOrMsg, ...args);
        }
    },
    warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
};
