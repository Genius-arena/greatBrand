const request = require('supertest');
const app = require('../../server');
const Event = require('../../src/models/eventModel');
const {sequelize} = require('../../src/config/database');

describe('Event Ticket Booking System', () => {
  beforeAll(async () => {
    // await sequelize.sync({ force: true});
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
  });

  afterEach(async () => {
    await Event.Event.destroy({ truncate: true });
  });

  describe('Event Initialization', () => {
    it('should initialize an event with specified tickets', async () => {
      const response = await request(app)
        .post('/api/events/initialize')
        .send({ totalTickets: 100, eventName:"PORT-Harcourt Picnic"});
      
      expect(response.statusCode).toBe(201);
      expect(response.body.eventId).toBeDefined();
    });
  });

  describe('Ticket Booking', () => {
    it('should book a ticket successfully', async () => {
      // Create event first
      const event = await Event.createEvent(50, "Calabar Carnival");

      const response = await request(app)
        .post('/book')
        .send({ 
          eventId: event.id,
          userId: 'user123' 
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.bookingId).toBeDefined();
    });

    it('should add to waiting list when tickets are sold out', async () => {
      const event = await Event.createEvent(1, "Abuja, Carnival");

      // Book first ticket
      await request(app)
        .post('/book')
        .send({ 
          eventId: event.id,
        });

      // Second booking should go to waiting list
      const response = await request(app)
        .post('/book')
        .send({ 
          eventId: event.id,
          userId: 'user2' 
        });
      
      expect(response.body.status).toBe('WAITING');
    });
  });
});

// tests/integration/eventApi.test.js
describe('Event API Integration', () => {
  it('should handle concurrent ticket bookings', async () => {
    const event = await Event.createEvent(10, "Lagos Party");
    
    const bookingPromises = Array(15).fill().map((_, index) => 
      request(app)
        .post('/book')
        .send({ 
          eventId: event.id,
          userId: `user${index}` 
        })
    );

    const responses = await Promise.all(bookingPromises);
    
    const confirmedBookings = responses.filter(
      res => res.body.status === 'CONFIRMED'
    );
    const waitingBookings = responses.filter(
      res => res.body.status === 'WAITING'
    );

    expect(confirmedBookings.length).toBe(10);
    expect(waitingBookings.length).toBe(5);
  });
});