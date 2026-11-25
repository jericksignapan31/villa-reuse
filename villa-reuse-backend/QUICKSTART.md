# Quick Start Guide - Villa-Reuse Backend

## Prerequisites

- Node.js v14+ (download from https://nodejs.org/)
- MongoDB (local or MongoDB Atlas account)
- npm (comes with Node.js)

## Step-by-Step Setup

### 1. Install MongoDB (if using local)

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Run installer and follow prompts
- MongoDB runs as a service

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
```

### 2. Navigate to Backend Directory

```bash
cd villa-reuse-backend
```

### 3. Install Dependencies

```bash
npm install
```

(Already done, but run this if adding new packages)

### 4. Configure Environment Variables

The `.env` file is already created. If you need to modify:

```bash
# Edit .env file
MONGODB_URI=mongodb://localhost:27017/villa-reuse
PORT=5000
NODE_ENV=development
JWT_SECRET=villa-reuse-secret-key-dev
CORS_ORIGIN=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/villa-reuse
```

### 5. Start the Server

**Start MongoDB (if using local):**
```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

**Start Backend Server:**
```bash
npm start
```

You should see:
```
Server running on port 5000
Environment: development
✅ MongoDB connected successfully
```

### 6. Verify Server is Running

Open in browser or terminal:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"success":true,"message":"Server is running"}
```

## Testing API Endpoints

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### 3. Get Current User (using token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with token from login response.

### 4. Create an Item

```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Coffee Machine",
    "description": "Barely used coffee maker",
    "category": "Kitchen",
    "type": "donation",
    "condition": "good",
    "pickupLocation": "Downtown Coffee Shop"
  }'
```

### 5. Get All Items

```bash
curl http://localhost:5000/api/items
```

### 6. Get Notifications

```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using Postman (Recommended for Testing)

1. Download Postman from https://www.postman.com/downloads/
2. Import API calls as shown above
3. Use "Bearer Token" in Authorization tab
4. Set environment variable `{{token}}` for reuse

**Postman Collection Template:**
```
1. Register: POST /api/auth/register
2. Login: POST /api/auth/login → Save token
3. Get Me: GET /api/auth/me (use saved token)
4. Create Item: POST /api/items (use saved token)
5. Get Items: GET /api/items
```

## Troubleshooting

### "Port 5000 already in use"
```bash
# Windows: Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux: Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

Change PORT in `.env` to 5001:
```
PORT=5001
```

### "MongoDB connection failed"

**Check if MongoDB is running:**
```bash
# Windows
Get-Process mongod

# Mac/Linux
ps aux | grep mongod
```

**Start MongoDB:**
```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Check connection string in .env:**
```
MONGODB_URI=mongodb://localhost:27017/villa-reuse
```

### "Cannot find module..."

Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### "Invalid token"

1. Make sure token is from recent login
2. Tokens expire after 24 hours (or 30 days if remember me)
3. Login again to get new token

## Development Tips

### Hot Reload (Auto-restart on file changes)

Install nodemon:
```bash
npm install -D nodemon
```

Update package.json:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Run with:
```bash
npm run dev
```

### View MongoDB Data

Install MongoDB Compass (GUI):
https://www.mongodb.com/products/compass

Or use mongosh (CLI):
```bash
mongosh
use villa-reuse
db.users.find()
db.items.find()
```

### Check Server Logs

The server prints request logs:
```
2026-11-25T11:10:00.025Z - GET /api/health
2026-11-25T11:10:03.388Z - POST /api/auth/login
```

## Common Development Workflow

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd villa-reuse-backend
npm start

# Terminal 3: Run Frontend
cd villa-reuse
npm run dev

# Terminal 4: Test API (optional)
# Use curl or Postman
```

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable HTTPS
- [ ] Set appropriate CORS_ORIGIN
- [ ] Add error logging
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add request logging
- [ ] Set up monitoring
- [ ] Backup database regularly

## Next Steps

1. **Frontend Integration**: Connect React components to backend APIs
2. **File Upload**: Implement image upload for items
3. **Real-time Notifications**: Add WebSockets
4. **Testing**: Write unit and integration tests
5. **Deployment**: Deploy to production server

## Resources

- Express.js Docs: https://expressjs.com/
- Mongoose Docs: https://mongoosejs.com/
- MongoDB Docs: https://docs.mongodb.com/
- JWT Docs: https://jwt.io/
- API Design: https://restfulapi.net/

## Support

If you encounter issues:

1. Check server logs for error messages
2. Verify MongoDB is running
3. Check `.env` file for correct configuration
4. Try restarting server
5. Check if ports are available
6. Review README.md for detailed API documentation

---

**Happy coding! 🚀**
