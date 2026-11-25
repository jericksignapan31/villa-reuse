# Villa-Reuse Backend API

Express.js + MongoDB backend for the Villa-Reuse community sharing platform.

## Features

✅ **User Authentication**
- User registration and login
- JWT token-based authentication
- Password hashing with bcryptjs
- User profiles and account management

✅ **Item Management**
- Create, read, update, delete items/listings
- Item filtering, searching, and sorting
- Item status tracking (available, reserved, completed, flagged)
- Favorites system

✅ **Request/Transaction System**
- Create requests for items
- Accept/reject requests
- Cancel requests
- Track transaction status
- Notes/communication between users

✅ **Notifications System**
- Multiple notification types (8 types)
- Mark as read/unread
- Delete notifications
- Unread count tracking

✅ **Admin & Moderation**
- Admin dashboard with statistics
- User management (view, suspend, restrict, restore)
- Listing management (remove inappropriate content)
- Report system for user-submitted reports
- Audit logs for admin actions

## Project Structure

```
villa-reuse-backend/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── controllers/         # Business logic
│   ├── authController.js
│   ├── itemController.js
│   ├── requestController.js
│   ├── notificationController.js
│   └── adminController.js
├── models/              # Database schemas
│   ├── User.js
│   ├── Item.js
│   ├── Request.js
│   ├── Notification.js
│   └── Report.js
├── middleware/          # Express middleware
│   └── auth.js          # JWT authentication & authorization
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── itemRoutes.js
│   ├── requestRoutes.js
│   ├── notificationRoutes.js
│   └── adminRoutes.js
├── server.js            # Main application entry point
├── package.json
├── .env                 # Environment variables (development)
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**`.env` file:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/villa-reuse
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=24h
JWT_REMEMBER_ME_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

For MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/villa-reuse
```

3. **Start MongoDB:**

**Local MongoDB:**
```bash
mongod
```

4. **Start the server:**

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require an Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `POST /profile` - Update profile (protected)
- `POST /change-password` - Change password (protected)
- `POST /notification-preferences` - Update notification preferences (protected)
- `GET /public/:userId` - Get public user profile

#### Items (`/items`)
- `GET /` - Get all items (with filters, search, pagination)
- `GET /:id` - Get single item
- `POST /` - Create item (protected)
- `PUT /:id` - Update item (protected)
- `DELETE /:id` - Delete item (protected)
- `GET /user/:userId/items` - Get items by user
- `GET /user/my/listings` - Get current user's items (protected)
- `GET /favorites/my/list` - Get favorites (protected)
- `POST /:id/favorite` - Add to favorites (protected)
- `DELETE /:id/favorite` - Remove from favorites (protected)
- `POST /:id/complete` - Mark item as completed (protected)

#### Requests (`/requests`)
- `POST /` - Create request (protected)
- `GET /` - Get user's requests (protected)
- `GET /:id` - Get single request (protected)
- `POST /:id/accept` - Accept request (protected, owner only)
- `POST /:id/reject` - Reject request (protected, owner only)
- `POST /:id/cancel` - Cancel request (protected, requester only)
- `POST /:id/complete` - Complete request (protected, requester only)
- `POST /:id/notes` - Add note to request (protected)

#### Notifications (`/notifications`)
- `GET /` - Get notifications (protected)
- `GET /unread/count` - Get unread count (protected)
- `GET /:id` - Get single notification (protected)
- `POST /:id/read` - Mark as read (protected)
- `POST /mark-all/read` - Mark all as read (protected)
- `POST /mark-multiple/read` - Mark multiple as read (protected)
- `DELETE /:id` - Delete notification (protected)
- `POST /delete-multiple` - Delete multiple notifications (protected)
- `DELETE /delete-all` - Delete all notifications (protected)

#### Admin (`/admin`)
- `POST /reports` - Create report (protected)
- `GET /reports` - Get all reports (admin only)
- `GET /reports/:id` - Get single report (admin only)
- `POST /reports/:id/resolve` - Resolve report (admin only)
- `GET /dashboard/stats` - Get dashboard statistics (admin only)
- `GET /users` - Get all users (admin only)
- `PUT /users/:userId/role` - Update user role (admin only)
- `POST /users/:userId/suspend` - Suspend user (admin only)
- `POST /users/:userId/restrict` - Restrict user (admin only)
- `POST /users/:userId/restore` - Restore user (admin only)
- `GET /listings` - Get all listings (admin only)
- `POST /listings/:itemId/remove` - Remove listing (admin only)

#### Health Check
- `GET /health` - Server health check

## Example API Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword",
  "rememberMe": false
}
```

### Create Item/Listing
```bash
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coffee Machine",
  "description": "Lightly used coffee maker",
  "category": "Kitchen Appliances",
  "type": "donation",
  "condition": "good",
  "pickupLocation": "123 Main St, Downtown",
  "photos": ["url1", "url2"]
}
```

### Create Request
```bash
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "60d5ec49c1234567890abc12",
  "message": "I'm interested in this item!"
}
```

## Database Models

### User
- Full name, email, phone, address
- Password (hashed)
- Profile picture
- Reputation score
- Role (user, moderator, admin)
- Status (active, suspended, restricted)
- Notification preferences
- Timestamps

### Item/Listing
- Name, description, category
- Type (donation or exchange)
- Condition (like new, good, fair, poor)
- Pickup location
- Photos
- Owner reference
- Status (available, reserved, completed, flagged)
- Favorites count and favorited by list
- Timestamps

### Request/Transaction
- Item reference
- Requester and owner references
- Status (pending, accepted, rejected, completed, cancelled)
- Message and notes history
- Ratings and reviews
- Timestamps

### Notification
- Recipient and sender references
- Type (8 notification types)
- Read/unread status
- Related item and request
- Title and message
- Timestamps

### Report
- Reporter reference
- Target type and ID (listing, user, message)
- Reason and description
- Status (pending, resolved)
- Admin action and resolution
- Timestamps

## Security Features

✅ **Password Security**
- Bcryptjs hashing with salt
- Pre-save hooks ensure passwords are always hashed
- Password comparison method for authentication

✅ **JWT Tokens**
- Secure token-based authentication
- Configurable expiration times (24h default, 30d remember me)
- Token verification on protected routes

✅ **Role-Based Access Control**
- User, moderator, and admin roles
- Route-level authorization checks
- Admin/moderator exclusive endpoints

✅ **Data Validation**
- Input validation on all endpoints
- Duplicate email checking
- Authorization checks on operations

✅ **Account Management**
- Account status tracking (active, suspended, restricted)
- Soft deletion (status change instead of hard delete)
- Account warnings and suspension system

## Error Handling

All endpoints return standardized JSON responses:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Performance Optimizations

✅ **Database Indexes**
- Indexed frequently queried fields
- Performance optimization for searches and filters

✅ **Pagination**
- Efficient data retrieval with skip/limit
- Prevents loading entire collections

✅ **Population Optimization**
- Selective field population (only needed fields)
- Reduces data transfer

## Future Enhancements

- [ ] File upload for item photos
- [ ] Real-time notifications with WebSockets
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Rating and review system
- [ ] Advanced search with Elasticsearch
- [ ] API rate limiting
- [ ] Request logging and monitoring
- [ ] Automated testing suite
- [ ] API documentation with Swagger/OpenAPI

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`
- Verify database credentials for MongoDB Atlas

### Port Already in Use
```bash
# Change PORT in .env to a different port (e.g., 5001)
# Or kill the process using port 5000
netstat -ano | findstr :5000  # Windows
kill -9 <PID>                  # Unix/Mac
```

### JWT Token Expired
- Login again to get a new token
- Use `rememberMe: true` for 30-day token

### CORS Issues
- Update CORS_ORIGIN in `.env` to match frontend URL
- Ensure Authorization header is included in requests

## Contributing

When adding new features:
1. Create corresponding model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Update this README with new endpoints
5. Test all endpoints with API client (Postman, etc.)

## License

MIT
