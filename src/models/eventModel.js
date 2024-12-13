const { Sequelize, DataTypes } = require('sequelize');
const logger = require('../utils/logger');
const redisClient = require('../config/cache')


// MySQL Sequelize Configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Event Model Definition
const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalTickets: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  availableTickets: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Booking Model Definition
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('CONFIRMED', 'WAITING_LIST'),
    defaultValue: 'CONFIRMED'
  }
});

// Associations
Event.hasMany(Booking);
Booking.belongsTo(Event);

// Database Synchronization
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    logger.info('Database connected and synchronized');
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
}

/**
 * Create a new event with specified ticket count
 * @param {number} totalTickets - Total number of tickets for the event
 * @param {string} eventName - Name of the event
 * @returns {Object} Created event details
 */
async function createEvent(totalTickets, eventName) {
  const transaction = await sequelize.transaction();

  try {
    const event = await Event.create(
      {
        name: eventName,
        totalTickets,
        availableTickets: totalTickets
      },
      { transaction }
    );

    // Cache event details
    await redisClient.set(`event:${event.id}`, JSON.stringify(event));

    await transaction.commit();
    return event;
  } catch (error) {
    await transaction.rollback();
    logger.error('Event creation failed', error);
    throw error;
  }
}

/**
 * Book a ticket for a user with concurrency handling
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the user
 * @returns {Object} Booking details
 */
async function bookTicket(eventId, userId) {
  const transaction = await sequelize.transaction();

  try {
    // Retrieve event with pessimistic locking
    const event = await Event.findByPk(eventId, {
      lock: true,
      transaction
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check ticket availability
    if (event.availableTickets > 0) {
      // Book confirmed ticket
      const booking = await Booking.create({
        userId,
        EventId: eventId,
        status: 'CONFIRMED'
      }, { transaction });

      // Decrement available tickets
      event.availableTickets -= 1;
      await event.save({ transaction });

      // Update cache
      await redisClient.set(`event:${eventId}`, JSON.stringify(event));

      await transaction.commit();
      return { id: booking.id, waitingList: false };
    } else {
      // Add to waiting list
      const booking = await Booking.create({
        userId,
        EventId: eventId,
        status: 'WAITING_LIST'
      }, { transaction });

      await transaction.commit();
      return { id: booking.id, waitingList: true };
    }
  } catch (error) {
    await transaction.rollback();
    logger.error('Ticket booking failed', error);
    throw error;
  }
}

/**
 * Cancel a user's ticket and manage waiting list
 * @param {string} bookingId - ID of the booking to cancel
 * @param {string} userId - ID of the user
 * @returns {Object} Cancellation details
 */
async function cancelTicket(bookingId, userId) {
  const transaction = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [Event],
      lock: true,
      transaction
    });

    if (!booking || booking.userId !== userId) {
      throw new Error('Invalid booking or unauthorized');
    }

    // Find next waiting list booking
    const waitingListBooking = await Booking.findOne({
      where: {
        EventId: booking.EventId,
        status: 'WAITING_LIST'
      },
      order: [['createdAt', 'ASC']],
      transaction
    });

    // Delete current booking
    await booking.destroy({ transaction });

    let waitingListAssigned = false;
    if (waitingListBooking) {
      // Promote waiting list booking
      waitingListBooking.status = 'CONFIRMED';
      await waitingListBooking.save({ transaction });
      waitingListAssigned = true;
    } else {
      // Increment available tickets if no waiting list
      const event = await Event.findByPk(booking.EventId, { transaction });
      event.availableTickets += 1;
      await event.save({ transaction });
    }

    await transaction.commit();
    return {
      waitingListAssigned,
      nextBookingId: waitingListAssigned ? waitingListBooking.id : null
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Ticket cancellation failed', error);
    throw error;
  }
}

/**
 * Retrieve current event status
 * @param {string} eventId - ID of the event
 * @returns {Object} Event status details
 */
async function getEventStatus(eventId) {
  try {
    // Try to get cached event first
    const cachedEvent = await redisClient.get(`event:${eventId}`);
    if (cachedEvent) {
      return JSON.parse(cachedEvent);
    }

    // Fallback to database
    const event = await Event.findByPk(eventId, {
      include: [{
        model: Booking,
        where: { status: 'WAITING_LIST' }
      }]
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const status = {
      eventId: event.id,
      availableTickets: event.availableTickets,
      totalTickets: event.totalTickets,
      waitingListCount: event.Bookings.length
    };

    // Cache the status
    await redisClient.set(`event:${eventId}`, JSON.stringify(status));

    return status;
  } catch (error) {
    logger.error('Event status retrieval failed', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  createEvent,
  bookTicket,
  cancelTicket,
  getEventStatus,
  Event,
  Booking,
};