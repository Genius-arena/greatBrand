// tests/integration/eventApi.test.js
const request = require('supertest');
const app = require('../../app');
const {sequelize} = require('../../src/config/database');

describe('Event Booking API Integration Tests', () => {
  let createdEventId;

  beforeAll(async () => {
    // Synchronize database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  test('POST /api/events/initialize should create a new event', async () => {
    const response = await request(app)
      .post('/api/events/initialize')
      .send({
        totalTickets: 100,
        eventName: 'Integration Test Concert'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Event successfully initialized');
    expect(response.body.totalTickets).toBe(100);
    
    createdEventId = response.body.eventId;
  });

  test('POST /api/events/book should book a ticket', async () => {
    const response = await request(app)
      .post('/api/events/book')
      .send({
        eventId: createdEventId,
        userId: 'integration-test-user'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Ticket successfully booked');
    expect(response.body.status).toBe('Confirmed');
  });

  test('GET /api/events/status/:eventId should retrieve event status', async () => {
    const response = await request(app)
      .get(`/api/events/status/${createdEventId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.eventId).toBe(createdEventId);
    expect(response.body.availableTickets).toBe(99);
    expect(response.body.totalTickets).toBe(100);
  });

  test('POST /api/events/cancel should cancel a ticket', async () => {
    // First book a ticket to cancel
    const bookResponse = await request(app)
      .post('/api/events/book')
      .send({
        eventId: createdEventId,
        userId: 'cancel-test-user'
      });

    const bookingId = bookResponse.body.bookingId;

    // Then cancel the ticket
    const cancelResponse = await request(app)
      .post('/api/events/cancel')
      .send({
        bookingId,
        userId: 'cancel-test-user'
      });

    expect(cancelResponse.statusCode).toBe(200);
    expect(cancelResponse.body.message).toBe('Ticket successfully cancelled');
  });

  test('Error handling for invalid event initialization', async () => {
    const response = await request(app)
      .post('/api/events/initialize')
      .send({
        totalTickets: -10,
        eventName: ''
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid event initialization');
  });
});