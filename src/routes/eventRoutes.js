// src/routes/eventRoutes.js
const express = require('express');
const {
  initializeEvent,
  bookTicketForUser,
  cancelUserTicket,
  getEventStatusDetails
} = require('../controllers/eventController');

const router = express.Router();

/**
 * @route POST /initialize
 * @desc Initialize a new event with tickets
 * @access Public
 */
router.post('/initialize', initializeEvent);

/**
 * @route POST /book
 * @desc Book a ticket for a user
 * @access Public
 */
router.post('/book', bookTicketForUser);

/**
 * @route POST /cancel
 * @desc Cancel a user's ticket
 * @access Public
 */
router.post('/cancel', cancelUserTicket);

/**
 * @route GET /status/:eventId
 * @desc Get current event ticket status
 * @access Public
 */
router.get('/status/:eventId', getEventStatusDetails);

module.exports = router;