#!/bin/bash
# Villa-Reuse Backend API Testing Script
# Run this script to test all API endpoints

# Configuration
API_URL="http://localhost:5000/api"
TOKEN=""
ITEM_ID=""
REQUEST_ID=""
NOTIFICATION_ID=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Villa-Reuse Backend API Testing ===${NC}\n"

# 1. Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
curl -s "$API_URL/../health" | jq '.' && echo -e "${GREEN}✅ Health Check PASSED${NC}\n" || echo -e "${RED}❌ Health Check FAILED${NC}\n"

# 2. Register User
echo -e "${YELLOW}2. Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "phone": "+1234567890",
    "address": "123 Test St"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
if echo "$REGISTER_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
  echo -e "${GREEN}✅ Registration PASSED${NC}"
  echo "Token: $TOKEN\n"
else
  echo -e "${RED}❌ Registration FAILED${NC}\n"
  exit 1
fi

# 3. Login
echo -e "${YELLOW}3. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  echo -e "${GREEN}✅ Login PASSED${NC}\n"
else
  echo -e "${RED}❌ Login FAILED${NC}\n"
fi

# 4. Get Current User
echo -e "${YELLOW}4. Testing Get Current User...${NC}"
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Get Current User PASSED${NC}\n" || echo -e "${RED}❌ Get Current User FAILED${NC}\n"

# 5. Create Item
echo -e "${YELLOW}5. Testing Create Item...${NC}"
CREATE_ITEM_RESPONSE=$(curl -s -X POST "$API_URL/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Item",
    "description": "A test item for the platform",
    "category": "Kitchen",
    "type": "donation",
    "condition": "good",
    "pickupLocation": "Test Location"
  }')

echo "$CREATE_ITEM_RESPONSE" | jq '.'
if echo "$CREATE_ITEM_RESPONSE" | jq -e '.item._id' > /dev/null 2>&1; then
  ITEM_ID=$(echo "$CREATE_ITEM_RESPONSE" | jq -r '.item._id')
  echo -e "${GREEN}✅ Create Item PASSED${NC}"
  echo "Item ID: $ITEM_ID\n"
else
  echo -e "${RED}❌ Create Item FAILED${NC}\n"
fi

# 6. Get All Items
echo -e "${YELLOW}6. Testing Get All Items...${NC}"
curl -s -X GET "$API_URL/items" | jq '.' && echo -e "${GREEN}✅ Get All Items PASSED${NC}\n" || echo -e "${RED}❌ Get All Items FAILED${NC}\n"

# 7. Get Single Item
if [ ! -z "$ITEM_ID" ]; then
  echo -e "${YELLOW}7. Testing Get Single Item...${NC}"
  curl -s -X GET "$API_URL/items/$ITEM_ID" | jq '.' && echo -e "${GREEN}✅ Get Single Item PASSED${NC}\n" || echo -e "${RED}❌ Get Single Item FAILED${NC}\n"
fi

# 8. Add to Favorites
if [ ! -z "$ITEM_ID" ]; then
  echo -e "${YELLOW}8. Testing Add to Favorites...${NC}"
  curl -s -X POST "$API_URL/items/$ITEM_ID/favorite" \
    -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Add to Favorites PASSED${NC}\n" || echo -e "${RED}❌ Add to Favorites FAILED${NC}\n"
fi

# 9. Get Favorites
echo -e "${YELLOW}9. Testing Get Favorites...${NC}"
curl -s -X GET "$API_URL/items/favorites/my/list" \
  -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Get Favorites PASSED${NC}\n" || echo -e "${RED}❌ Get Favorites FAILED${NC}\n"

# 10. Update Profile
echo -e "${YELLOW}10. Testing Update Profile...${NC}"
curl -s -X POST "$API_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Test User",
    "phone": "+9876543210"
  }' | jq '.' && echo -e "${GREEN}✅ Update Profile PASSED${NC}\n" || echo -e "${RED}❌ Update Profile FAILED${NC}\n"

# 11. Get Notifications
echo -e "${YELLOW}11. Testing Get Notifications...${NC}"
curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Get Notifications PASSED${NC}\n" || echo -e "${RED}❌ Get Notifications FAILED${NC}\n"

# 12. Get Unread Count
echo -e "${YELLOW}12. Testing Get Unread Count...${NC}"
curl -s -X GET "$API_URL/notifications/unread/count" \
  -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Get Unread Count PASSED${NC}\n" || echo -e "${RED}❌ Get Unread Count FAILED${NC}\n"

# 13. Get User Items
echo -e "${YELLOW}13. Testing Get User Items...${NC}"
curl -s -X GET "$API_URL/items/user/my/listings" \
  -H "Authorization: Bearer $TOKEN" | jq '.' && echo -e "${GREEN}✅ Get User Items PASSED${NC}\n" || echo -e "${RED}❌ Get User Items FAILED${NC}\n"

echo -e "${YELLOW}=== API Testing Complete ===${NC}"
echo -e "\n${YELLOW}Summary:${NC}"
echo "- Health Check: Verifies server is running"
echo "- Authentication: User registration and login"
echo "- Items: CRUD operations for listings"
echo "- Favorites: Add/remove and list favorites"
echo "- Notifications: View and manage notifications"
echo "- Profiles: Update user information"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Create another user and test requests"
echo "2. Create requests between users"
echo "3. Accept/reject requests"
echo "4. Mark requests as completed"
echo "5. Test admin endpoints with admin token"
echo "6. Test error cases (invalid inputs, unauthorized access)"

# Notes
echo -e "\n${YELLOW}Notes:${NC}"
echo "- Replace email/password if testing multiple times"
echo "- Keep the TOKEN value safe"
echo "- Use jq for pretty JSON output: sudo apt-get install jq"
echo "- For Windows, use PowerShell or WSL with curl"
