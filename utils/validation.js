// src/utils/validation.js
const Joi = require('joi');

/**
 * Validate event initialization input
 * @param {Object} data - Input data for event initialization
 * @returns {Object} Validation result
 */
function validateEventInitialization(data) {
  const schema = Joi.object({
    totalTickets: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.base': 'Total tickets must be a number',
        'number.min': 'Total tickets must be at least 1',
        'number.max': 'Total tickets cannot exceed 10000'
      }),
    eventName: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Event name is required',
        'string.min': 'Event name must be at least 3 characters',
        'string.max': 'Event name cannot exceed 100 characters'
      })
  });

  return schema.validate(data);
}

/**
 * Validate ticket booking input
 * @param {Object} data - Input data for ticket booking
 * @returns {Object} Validation result
 */
function validateBooking(data) {
  const schema = Joi.object({
    eventId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.guid': 'Invalid event ID format'
      }),
    userId: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'User ID is required',
        'string.min': 'User ID must be at least 3 characters',
        'string.max': 'User ID cannot exceed 50 characters'
      })
  });

  return schema.validate(data);
}

module.exports = {
  validateEventInitialization,
  validateBooking
};