// src/controllers/eventController.js
const { createEvent, bookTicket, cancelTicket, getEventStatus } = require('../models/eventModel');
const logger = require('../utils/logger');
const { validateEventInitialization, validateBooking } = require('../utils/validation');

/**
 * Initialize a new event with a specified number of tickets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Event initialization response
 */
async function initializeEvent(req, res) {
  console.log(req.body);
  try {
    // Validate input
    const { error } = validateEventInitialization(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid event initialization',
        details: error.details
      });
    }

    const { totalTickets, eventName } = req.body;
    const event = await createEvent(totalTickets, eventName);

    logger.info(`Event initialized: ${eventName}, Tickets: ${totalTickets}`);

    res.status(201).json({
      message: 'Event successfully initialized',
      eventId: event.id,
      totalTickets: event.totalTickets
    });
  } catch (err) {
    logger.error('Event initialization error', err);
    res.status(500).json({
      error: 'Failed to initialize event',
      details: err.message
    });
  }
}

/**
 * Book a ticket for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Ticket booking response
 */
async function bookTicketForUser(req, res) {
  try {
    // Validate input
    const { error } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid booking request',
        details: error.details
      });
    }

    const { eventId, userId } = req.body;
    const booking = await bookTicket(eventId, userId);

    logger.info(`Ticket booked for user ${userId} on event ${eventId}`);

    res.status(booking.waitingList ? 201 : 200).json({
      message: booking.waitingList
        ? 'Added to waiting list'
        : 'Ticket successfully booked',
      bookingId: booking.id,
      status: booking.waitingList ? 'Waiting List' : 'Confirmed'
    });
  } catch (err) {
    logger.error('Ticket booking error', err);
    res.status(500).json({
      error: 'Failed to book ticket',
      details: err.message
    });
  }
}

/**
 * Cancel a user's ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Ticket cancellation response
 */
async function cancelUserTicket(req, res) {
  try {
    const { bookingId, userId } = req.body;

    // Input validation would be added here
    const cancellation = await cancelTicket(bookingId, userId);

    logger.info(`Ticket cancelled for user ${userId}, Booking ID: ${bookingId}`);

    res.status(200).json({
      message: cancellation.waitingListAssigned
        ? 'Ticket cancelled and assigned to waiting list'
        : 'Ticket successfully cancelled',
      details: cancellation
    });
  } catch (err) {
    logger.error('Ticket cancellation error', err);
    res.status(500).json({
      error: 'Failed to cancel ticket',
      details: err.message
    });
  }
}

/**
 * Get current event status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Event status details
 */
async function getEventStatusDetails(req, res) {
  try {
    const { eventId } = req.params;

    const status = await getEventStatus(eventId);

    res.status(200).json({
      eventId,
      availableTickets: status.availableTickets,
      totalTickets: status.totalTickets,
      waitingListCount: status.waitingListCount
    });
  } catch (err) {
    logger.error('Event status retrieval error', err);
    res.status(500).json({
      error: 'Failed to retrieve event status',
      details: err.message
    });
  }
}

module.exports = {
  initializeEvent,
  bookTicketForUser,
  cancelUserTicket,
  getEventStatusDetails
};