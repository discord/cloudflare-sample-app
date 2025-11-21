/**
 * Structured logging utility for Cloudflare Workers.
 * Provides consistent logging with levels, timestamps, and context.
 */

/**
 * Log levels in order of severity
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Current minimum log level (can be configured via environment)
 * @type {string}
 */
let currentLogLevel = LogLevel.INFO;

/**
 * Log level hierarchy for filtering
 */
const LOG_LEVEL_PRIORITY = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Sets the minimum log level for the logger.
 * @param {string} level - Log level from LogLevel enum
 */
export function setLogLevel(level) {
  if (LOG_LEVEL_PRIORITY[level] !== undefined) {
    currentLogLevel = level;
  }
}

/**
 * Formats a log message with timestamp, level, and context.
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level}: ${message}${contextStr}`;
}

/**
 * Determines if a message should be logged based on current log level.
 * @param {string} level - Log level to check
 * @returns {boolean} True if message should be logged
 */
function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel];
}

/**
 * Logs a debug message.
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
export function debug(message, context = {}) {
  if (shouldLog(LogLevel.DEBUG)) {
    console.log(formatLogMessage(LogLevel.DEBUG, message, context));
  }
}

/**
 * Logs an info message.
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
export function info(message, context = {}) {
  if (shouldLog(LogLevel.INFO)) {
    console.log(formatLogMessage(LogLevel.INFO, message, context));
  }
}

/**
 * Logs a warning message.
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
export function warn(message, context = {}) {
  if (shouldLog(LogLevel.WARN)) {
    console.warn(formatLogMessage(LogLevel.WARN, message, context));
  }
}

/**
 * Logs an error message.
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data (can include error object)
 */
export function error(message, context = {}) {
  if (shouldLog(LogLevel.ERROR)) {
    // If context includes an error object, extract useful info
    const enrichedContext = { ...context };
    if (context.error instanceof Error) {
      enrichedContext.errorName = context.error.name;
      enrichedContext.errorMessage = context.error.message;
      enrichedContext.errorStack = context.error.stack;
      delete enrichedContext.error; // Remove the error object to avoid circular references
    }
    console.error(formatLogMessage(LogLevel.ERROR, message, enrichedContext));
  }
}

/**
 * Logs interaction-specific information.
 * @param {string} interactionType - Type of Discord interaction
 * @param {string} commandName - Command name (if applicable)
 * @param {string} message - Log message
 * @param {Object} [additionalContext] - Additional context data
 */
export function logInteraction(interactionType, commandName, message, additionalContext = {}) {
  const context = {
    interactionType,
    commandName: commandName || 'N/A',
    ...additionalContext,
  };
  info(message, context);
}

/**
 * Logs performance metrics.
 * @param {string} operation - Name of the operation
 * @param {number} durationMs - Duration in milliseconds
 * @param {Object} [additionalContext] - Additional context data
 */
export function logPerformance(operation, durationMs, additionalContext = {}) {
  const context = {
    operation,
    durationMs,
    ...additionalContext,
  };
  info('Performance metric', context);
}

/**
 * Creates a timer for measuring operation duration.
 * @param {string} operation - Name of the operation to time
 * @returns {Object} Timer object with end() method
 */
export function startTimer(operation) {
  const startTime = Date.now();
  return {
    /**
     * Ends the timer and logs the duration.
     * @param {Object} [context] - Additional context data
     */
    end: (context = {}) => {
      const duration = Date.now() - startTime;
      logPerformance(operation, duration, context);
      return duration;
    },
  };
}

/**
 * Default logger instance with all methods.
 */
export default {
  debug,
  info,
  warn,
  error,
  logInteraction,
  logPerformance,
  startTimer,
  setLogLevel,
  LogLevel,
};
