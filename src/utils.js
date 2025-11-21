/**
 * Utility functions for the awwbot application.
 */

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve within the timeout,
 * it rejects with a timeout error.
 * @param {Promise} promise - The promise to wrap with a timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} [operationName='Operation'] - Name of the operation for error messages
 * @returns {Promise} Promise that resolves with the original promise or rejects on timeout
 * @throws {Error} Throws an error if the operation times out
 */
export async function withTimeout(promise, timeoutMs, operationName = 'Operation') {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Creates a timeout error that can be easily identified.
 * @param {string} operationName - Name of the operation that timed out
 * @param {number} timeoutMs - Timeout value in milliseconds
 * @returns {Error} Timeout error object
 */
export function createTimeoutError(operationName, timeoutMs) {
  const error = new Error(`${operationName} timed out after ${timeoutMs}ms`);
  error.name = 'TimeoutError';
  error.isTimeout = true;
  return error;
}

/**
 * Checks if an error is a timeout error.
 * @param {Error} error - Error to check
 * @returns {boolean} True if the error is a timeout error
 */
export function isTimeoutError(error) {
  return error && (error.isTimeout === true || error.name === 'TimeoutError');
}
