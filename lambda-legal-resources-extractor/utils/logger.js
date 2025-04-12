/**
 * Simple logger utility for Lambda functions
 */
const logger = {
    /**
     * Log info level message
     * @param {string} message - Message to log
     */
    info: (message) => {
      console.log(JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message
      }));
    },
    
    /**
     * Log warning level message
     * @param {string} message - Message to log
     */
    warn: (message) => {
      console.log(JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message
      }));
    },
    
    /**
     * Log error level message
     * @param {string} message - Message to log
     * @param {Error} [error] - Optional error object
     */
    error: (message, error) => {
      console.error(JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }));
    },
    
    /**
     * Log debug level message (only in development)
     * @param {string} message - Message to log
     * @param {any} [data] - Optional data to log
     */
    debug: (message, data) => {
      if (process.env.DEBUG === 'true') {
        console.log(JSON.stringify({
          level: 'DEBUG',
          timestamp: new Date().toISOString(),
          message,
          data
        }));
      }
    }
  };
  
  module.exports = {
    logger
  };