const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 *
 * Runs the given Joi schema against the specified request source
 * (body, query, or params). Strips unknown fields for security.
 *
 * @param {object} schema - Joi schema
 * @param {string} source - 'body' | 'query' | 'params'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // Collect all errors, not just the first
      stripUnknown: true,  // Remove fields not in the schema
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ApiError(400, 'Validation failed', messages));
    }

    // Replace with sanitised/coerced values
    req[source] = value;
    next();
  };
};

module.exports = validate;
