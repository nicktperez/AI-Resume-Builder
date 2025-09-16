// Simple logger that works in both server and client environments
const isServer = typeof window === 'undefined';

const logger = {
  error: (message: string, error?: Error, meta?: any) => {
    if (isServer) {
      console.error(`[ERROR] ${message}`, error?.stack, meta);
    } else {
      console.error(`[ERROR] ${message}`, error, meta);
    }
  },
  info: (message: string, meta?: any) => {
    if (isServer) {
      console.log(`[INFO] ${message}`, meta);
    } else {
      console.log(`[INFO] ${message}`, meta);
    }
  },
  warn: (message: string, meta?: any) => {
    if (isServer) {
      console.warn(`[WARN] ${message}`, meta);
    } else {
      console.warn(`[WARN] ${message}`, meta);
    }
  },
  debug: (message: string, meta?: any) => {
    if (isServer) {
      console.debug(`[DEBUG] ${message}`, meta);
    } else {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }
};

export default logger;

// Convenience functions
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.stack, ...meta });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};
