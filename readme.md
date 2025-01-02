# Event Ticket Booking System

## Overview
This is a comprehensive Node.js-based Event Ticket Booking System designed to handle concurrent ticket bookings, waiting lists, and provide robust error handling.

## System Architecture
The application follows a modular MVC (Model-View-Controller) architecture with additional layers for enhanced modularity and separation of concerns.

### Architectural Components
- **Model**: Handles data logic and database interactions
- **Controller**: Manages business logic and request handling
- **Routes**: Defines API endpoint mappings
- **Middleware**: Provides request preprocessing and error handling
- **Utilities**: Offers helper functions for validation, logging, etc.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Sequelize ORM)
- **Caching**: Redis
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Validation**: Joi
- **Clustering**: Node.js Cluster Module

## Key Features
1. Concurrent ticket booking
2. Automatic waiting list management
3. Thread-safe database operations
4. Comprehensive error handling
5. Performance optimization with caching
6. Robust logging mechanism

## Package Details

### Core Packages
1. **express**: 
   - **Advantages**: 
     - Lightweight web framework
     - Extensive middleware support
     - Easy routing
   - **Disadvantages**: 
     - Requires additional configurations
     - Less opinionated compared to other frameworks

2. **sequelize**: 
   - **Advantages**:
     - ORM with multiple database support
     - Robust migration tools
     - Complex query handling
   - **Disadvantages**:
     - Performance overhead
     - Complex configuration

3. **ioredis**:
   - **Advantages**:
     - High-performance Redis client
     - Cluster and sentinel support
     - Promises and async/await support
   - **Disadvantages**:
     - Learning curve
     - Memory consumption

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- MySQL Server
- Redis Server

## Environment Variables
### Create a .env file with the following variables:

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=event_booking_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info

### Environment Configuration
#### Server Configuration
PORT=3000
NODE_ENV=development

#### Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=event_booking_db

#### Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

#### Logging
LOG_LEVEL=info

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Configure database and Redis connection details

### Installation Steps
```bash
npm install
npm run migrate
npm start
```

## Running Tests
```bash
# Run all tests
npm test

# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# End-to-End Tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## API Documentation
 ~~ The text in the curly bracket {} are all json

1. Initialize Event
Create a new event with a specified number of tickets.

Endpoint: POST /api/events/initialize

Request Body:
{
  "eventName": "Concert Name",
  "totalTickets": 100
}

Success Response (201)
{
  "message": "Event successfully initialized",
  "eventId": "uuid-string",
  "totalTickets": 100
}

Error Response (400):
{
  "error": "Invalid event initialization",
  "details": [
    {
      "message": "Total tickets must be a positive number"
    }
  ]
}

2. Book Ticket
Book a ticket for a specific event.

Endpoint: POST /api/events/book

Request Body:
{
  "eventId": "event-uuid",
  "userId": "user-identifier"
}

Success Response (200):
{
  "message": "Ticket successfully booked",
  "bookingId": "booking-uuid",
  "status": "Confirmed"
}

Waiting List Response (201):
{
  "message": "Added to waiting list",
  "bookingId": "booking-uuid",
  "status": "Waiting List"
}


3. Cancel Ticket
Cancel a booked ticket.

Endpoint: POST /api/events/cancel

Request Body:
{
  "bookingId": "booking-uuid",
  "userId": "user-identifier"
}

Success Response (200):
{
  "message": "Ticket successfully cancelled",
  "details": {
    "waitingListAssigned": true,
    "nextBookingId": "next-booking-uuid"
  }
}


4. Get Event Status
Retrieve current status of an event.
Endpoint: GET /api/events/status/:eventId

Success Response (200):
{
  "eventId": "event-uuid",
  "availableTickets": 50,
  "totalTickets": 100,
  "waitingListCount": 5
}


## Error Responses
All endpoints may return the following error responses:

Bad Request (400)
{
  "error": "Invalid input",
  "details": "Error description"
}

Not Found 404
{
  "error": "Resource not found",
  "details": "Specified resource could not be found"
}

Server Error (500)
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}

## Test Coverage Targets
- Unit Tests: 85%
- Integration Tests: 75%
- E2E Tests: 65%

## Performance Considerations
- Implemented clustering for multi-core CPU utilization
- Redis caching for frequently accessed data
- Pessimistic locking for concurrent database operations

## Security Measures
- Input validation
- Rate limiting
- Error obfuscation
- Secure HTTP headers

## Scaling Strategies
1. Horizontal scaling via containerization

## These test suites cover multiple aspects of the Event Ticket Booking System:

## Unit Tests (eventModel.test.js)

Test individual model methods in isolation
Verify core logic for event creation, booking, cancellation
Check database interactions and state changes

## Integration Tests (eventApi.test.js)

Test API endpoints end-to-end
Verify request/response handling
Check error handling and validation
Test complete API workflow

## End-to-End Tests (eventBookingWorkflow.test.js)

Simulate real-world booking scenarios
Test concurrent booking and cancellation
Stress test the system's concurrency handling
Validate complex interaction workflows

## Test Configuration (jest.config.js)

Configure Jest testing framework
Set coverage thresholds
Define test environment settings

## Key Testing Strategies:

Comprehensive test coverage
Concurrent operation simulation
Error case testing
Performance stress testing