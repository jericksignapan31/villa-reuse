# Villa-Reuse Backend Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Frontend)                       │
│                    Next.js React Application                         │
│                      (port 3000)                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP/REST API Calls
                      JWT Bearer Token
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                             │
│                        (port 5000)                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                          │   │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • CORS Handler          • Request Parser                      │  │
│  │ • JWT Verification      • Request Logging                     │  │
│  │ • Authorization Check   • Error Handler                       │  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ROUTES LAYER                              │   │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • authRoutes (6 endpoints)                                   │  │
│  │ • itemRoutes (10 endpoints)                                  │  │
│  │ • requestRoutes (8 endpoints)                                │  │
│  │ • notificationRoutes (8 endpoints)                           │  │
│  │ • adminRoutes (14 endpoints)                                 │  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 CONTROLLER LAYER                             │   │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • authController      • itemController                        │  │
│  │ • requestController   • notificationController               │  │
│  │ • adminController                                            │  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MODEL LAYER                               │   │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • User Model          • Item Model                            │  │
│  │ • Request Model       • Notification Model                    │  │
│  │ • Report Model                                               │  │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                 Mongoose ORM / MongoDB Queries
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│                    MongoDB Collections                               │
├────────────────────────────────────────────────────────────────────┤
│ • users (User data, auth info)                                      │
│ • items (Listings, products)                                        │
│ • requests (Transactions, requests)                                 │
│ • notifications (Activity notifications)                            │
│ • reports (User reports, moderation)                                │
└────────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Diagram

```
┌──────────────────────────────────┐
│   Client (Next.js) sends        │
│   HTTP Request with JWT token   │
└──────────────────┬───────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Express.js Server  │
         ├─────────────────────┤
         │ 1. Parse Request    │
         │ 2. CORS Check       │
         │ 3. JWT Validation   │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  Route Matching     │
         │  (Find endpoint)    │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │ Authorization Check │
         │ (Role verification) │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  Call Controller    │
         │  (Business Logic)   │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │ Query/Update DB     │
         │ (Mongoose Models)   │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │ Format Response     │
         │ (JSON payload)      │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  Send Response      │
         │  (HTTP 200/400/500) │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Client Receives Data │
         │ (Render UI)          │
         └──────────────────────┘
```

## 🗄️ Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                   USERS                                     │
├─────────────────────────────────────────────────────────────┤
│ _id | name | email | password | phone | role | status      │
│ ... | rating | profilePicture | createdAt | updatedAt      │
└────────────────┬──────────────────────────────────────────┘
                 │
        ┌────────┴────────┬─────────────┬────────────────┐
        │                 │             │                │
        ▼                 ▼             ▼                ▼
    ITEMS           REQUESTS      NOTIFICATIONS       REPORTS
  (owns many)    (sent by user)  (received by)    (filed by)
  
  Items Model          Request Model        Notification        Report Model
  ├─owner (FK)         ├─requester (FK)      Model              ├─reporter (FK)
  ├─name               ├─owner (FK)          ├─recipient (FK)    ├─targetId
  ├─category           ├─item (FK)           ├─sender (FK)       ├─targetType
  ├─type               ├─status              ├─type              ├─status
  ├─condition          ├─message             ├─isRead            ├─reason
  ├─photos             ├─notes               ├─createdAt         └─resolution
  ├─favoritedBy        └─completedDate       └─readAt
  └─status
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER REGISTRATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User submits: email, password, name, phone, address    │
│          │                                                 │
│          ▼                                                 │
│  2. Validate input (required fields, email format)         │
│          │                                                 │
│          ▼                                                 │
│  3. Check if email already exists in database              │
│          │                                                 │
│          ▼                                                 │
│  4. Hash password with bcryptjs                            │
│          │                                                 │
│          ▼                                                 │
│  5. Create User document in MongoDB                        │
│          │                                                 │
│          ▼                                                 │
│  6. Generate JWT token (24h expiration)                    │
│          │                                                 │
│          ▼                                                 │
│  7. Return token + user data to client                     │
│          │                                                 │
│          ▼                                                 │
│  8. Client stores token in localStorage                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     USER LOGIN                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User submits: email, password                          │
│          │                                                 │
│          ▼                                                 │
│  2. Find user by email in database                         │
│          │                                                 │
│          ▼                                                 │
│  3. Compare password with stored hash                      │
│          │                                                 │
│          ▼                                                 │
│  4. Check account status (active/suspended/restricted)     │
│          │                                                 │
│          ▼                                                 │
│  5. Generate JWT token                                     │
│    (24h default OR 30d if remember me selected)            │
│          │                                                 │
│          ▼                                                 │
│  6. Return token + user data                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              PROTECTED ENDPOINT ACCESS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Client sends request with Authorization header         │
│     Authorization: Bearer <token>                          │
│          │                                                 │
│          ▼                                                 │
│  2. Server extracts token from header                      │
│          │                                                 │
│          ▼                                                 │
│  3. Verify JWT signature                                   │
│    (Decode and validate token)                             │
│          │                                                 │
│          ▼                                                 │
│  4. Extract user ID from token                             │
│          │                                                 │
│          ▼                                                 │
│  5. Look up user in database                               │
│          │                                                 │
│          ▼                                                 │
│  6. Check account status                                   │
│          │                                                 │
│          ▼                                                 │
│  7. Grant access to endpoint                               │
│          │                                                 │
│          ▼                                                 │
│  8. Execute controller logic                               │
│          │                                                 │
│          ▼                                                 │
│  9. Return response to client                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Notification Workflow

```
Event Trigger (e.g., Request Created)
        │
        ▼
Controller Detects Event
        │
        ▼
Notification.create() Called
        │
        ▼
│├─ recipient (Who gets it)
│├─ sender (Who triggered it)
│├─ type (What type: new_request, etc.)
│├─ title & message
│├─ relatedItem/relatedRequest
│└─ timestamp
        │
        ▼
Saved to MongoDB
        │
        ▼
Frontend Polls GET /api/notifications
        │
        ▼
Display Notification to User
        │
        ▼
User Can:
├─ Mark as Read
├─ Delete
├─ View Details
└─ Take Action (Accept Request, etc.)
```

## 🔗 API Endpoint Categories

```
PUBLIC ENDPOINTS (No authentication needed)
├─ GET  /api/health
├─ GET  /api/items
├─ GET  /api/items/:id
├─ POST /api/auth/register
└─ POST /api/auth/login

PROTECTED ENDPOINTS (Requires JWT token)
├─ GET  /api/auth/me
├─ POST /api/auth/profile
├─ POST /api/items (create)
├─ PUT  /api/items/:id (update)
├─ DELETE /api/items/:id
├─ POST /api/items/:id/favorite
├─ GET  /api/items/favorites/my/list
├─ POST /api/requests (create)
├─ GET  /api/requests
├─ POST /api/requests/:id/accept
├─ POST /api/requests/:id/reject
├─ GET  /api/notifications
├─ POST /api/notifications/:id/read
└─ POST /api/admin/reports (file report)

ADMIN ENDPOINTS (Requires Admin/Moderator role)
├─ GET  /api/admin/dashboard/stats
├─ GET  /api/admin/users
├─ PUT  /api/admin/users/:userId/role
├─ POST /api/admin/users/:userId/suspend
├─ GET  /api/admin/reports
├─ POST /api/admin/reports/:id/resolve
├─ GET  /api/admin/listings
└─ POST /api/admin/listings/:itemId/remove
```

## 📈 Scalability Architecture

```
Current Setup (Development)
┌─────────────────┐     ┌──────────────┐
│   Local Node    │────▶│  Local Mongo │
│   (port 5000)   │     │  (port 27017)│
└─────────────────┘     └──────────────┘

Future Setup (Production)
┌─────────────────┐     ┌──────────────┐
│  Load Balancer  │     │ MongoDB Atlas│
└────────┬────────┘     └──────────────┘
         │
    ┌────┼────┬────────┐
    │    │    │        │
    ▼    ▼    ▼        ▼
  ┌──┐ ┌──┐ ┌──┐ ... ┌──┐
  │N1│ │N2│ │N3│     │Nn│  Node.js Cluster
  └──┘ └──┘ └──┘     └──┘

Additional Services:
├─ Redis (Caching)
├─ Elasticsearch (Search)
├─ Message Queue (Notifications)
└─ CDN (Static Files)
```

---

## 🎯 Key Design Patterns

1. **MVC Pattern**: Models → Controllers → Routes
2. **Middleware Pattern**: Chain of responsibility for request handling
3. **Repository Pattern**: Database abstraction with Mongoose
4. **Factory Pattern**: User, Item, Request, Notification creation
5. **Strategy Pattern**: Different notification types
6. **Observer Pattern**: Notifications on events

---

This architecture is designed for:
- ✅ Scalability (can add more Node instances)
- ✅ Maintainability (clear separation of concerns)
- ✅ Security (layered authorization)
- ✅ Performance (indexes, pagination)
- ✅ Reliability (error handling, validation)
