export default function createLogger() {
  return {
    debug: (message, ...optionalParams) => console.log(`\x1b[34m[DEBUG]\x1b[0m ${message}`, ...optionalParams),
    error: (message, ...optionalParams) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`, ...optionalParams),
    info: (message, ...optionalParams) => console.log(`\x1b[37m[INFO]\x1b[0m ${message}`, ...optionalParams),
    success: (message, ...optionalParams) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`, ...optionalParams),
    warn: (message, ...optionalParams) => console.log(`\x1b[33m[WARN]\x1b[0m ${message}`, ...optionalParams),
};
}
