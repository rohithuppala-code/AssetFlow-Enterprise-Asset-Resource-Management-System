/**
 * Standard API response wrapper.
 * Used by controllers to ensure consistent response shape.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable message
   * @param {object} data       - Response payload
   */
  constructor(statusCode, message = 'Success', data = {}) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

module.exports = ApiResponse;
