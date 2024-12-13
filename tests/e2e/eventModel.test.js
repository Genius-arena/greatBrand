const { 
    createEvent, 
    bookTicket, 
    cancelTicket, 
    getEventStatus,
    Booking
  } = require('../../src/models/eventModel');
  const {sequelize} = require('../../src/config/database');

  
  describe('Event Model Unit Tests', () => {
    let testEvent;
    let testUserId;
  
    beforeAll(async () => {
      // Synchronize database before tests
      await sequelize.sync({ force: true });
      testUserId = 'test-user-1';
    });
  
    afterAll(async () => {
      // Close database connection
      await sequelize.close();
    });
  
    test('createEvent should successfully create an event', async () => {
      testEvent = await createEvent(100, 'Test Concert');
      
      expect(testEvent).toBeDefined();
      expect(testEvent.name).toBe('Test Concert');
      expect(testEvent.totalTickets).toBe(100);
      expect(testEvent.availableTickets).toBe(100);
    });
  
    test('bookTicket should book a ticket successfully', async () => {
      const booking = await bookTicket(testEvent.id, testUserId);
      
      expect(booking).toBeDefined();
      expect(booking.waitingList).toBe(false);
      
      // Verify event's available tickets decreased
      const updatedEvent = await Event.findByPk(testEvent.id);
      expect(updatedEvent.availableTickets).toBe(99);
    });
  
    test('bookTicket should add to waiting list when no tickets available', async () => {
      // Book all remaining tickets
      for (let i = 0; i < 99; i++) {
        await bookTicket(testEvent.id, `user-${i}`);
      }
  
      // Next booking should be on waiting list
      const waitingListBooking = await bookTicket(testEvent.id, 'waiting-list-user');
      
      expect(waitingListBooking.waitingList).toBe(true);
    });
  
    test('cancelTicket should handle ticket cancellation', async () => {
      // Create a booking to cancel
      const bookingToCancel = await Booking.create({
        userId: 'cancel-user',
        EventId: testEvent.id,
        status: 'CONFIRMED'
      });
  
      const cancellation = await cancelTicket(bookingToCancel.id, 'cancel-user');
      
      expect(cancellation).toBeDefined();
      expect(cancellation.waitingListAssigned).toBe(false);
    });
  
    test('getEventStatus should return correct event status', async () => {
      const status = await getEventStatus(testEvent.id);
      
      expect(status).toBeDefined();
      expect(status.totalTickets).toBe(100);
      expect(status.availableTickets).toBeLessThan(100);
    });
  });