@echo off
REM Villa-Reuse Backend API Testing Script (Windows)
REM Run this script to test all API endpoints

setlocal enabledelayedexpansion

set API_URL=http://localhost:5000/api
set TOKEN=
set ITEM_ID=
set REQUEST_ID=
set NOTIFICATION_ID=

echo.
echo ===== Villa-Reuse Backend API Testing =====
echo.

REM 1. Health Check
echo Testing Health Check...
curl -s %API_URL%/../health
echo.
echo.

REM 2. Register User
echo Testing User Registration...
for /f "tokens=*" %%i in ('curl -s -X POST "%API_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "^{^\"name^\"^:^\"Test User^\"^,^\"email^\"^:^\"test@example.com^\"^,^\"password^\"^:^\"testpass123^\"^,^\"phone^\"^:^\"^+1234567890^\"^,^\"address^\"^:^\"123 Test St^\"^}"') do set "REGISTER_RESPONSE=%%i"

echo %REGISTER_RESPONSE%
echo.
echo.

REM Extract token (requires jq or manual parsing)
echo Note: Save the token from the response above and use it for authenticated requests
echo.

REM 3. Login
echo Testing Login...
curl -s -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "^{^\"email^\"^:^\"test@example.com^\"^,^\"password^\"^:^\"testpass123^\"^}"
echo.
echo.

REM 4. Get All Items
echo Testing Get All Items...
curl -s -X GET "%API_URL%/items"
echo.
echo.

REM 5. Get Notifications (requires token)
echo.
echo NOTE: To test authenticated endpoints, run the script with a valid token:
echo.
echo 1. Register or login to get a token
echo 2. Set the TOKEN variable with your token
echo 3. Run authenticated tests
echo.
echo Example:
echo   set TOKEN=your_token_here
echo   curl -s -X GET "%API_URL%/notifications" -H "Authorization: Bearer !TOKEN!"
echo.

echo.
echo ===== API Testing Guide =====
echo.
echo Endpoints to test:
echo.
echo [PUBLIC]
echo   - GET %API_URL%/../health
echo   - GET %API_URL%/items
echo   - GET %API_URL%/items/^<id^>
echo   - POST %API_URL%/auth/register
echo   - POST %API_URL%/auth/login
echo.
echo [PROTECTED - Requires Authorization Header]
echo   - GET %API_URL%/auth/me
echo   - POST %API_URL%/auth/profile
echo   - POST %API_URL%/items
echo   - GET %API_URL%/items/favorites/my/list
echo   - POST %API_URL%/items/^<id^>/favorite
echo   - GET %API_URL%/notifications
echo   - GET %API_URL%/requests
echo.
echo [ADMIN - Requires Admin Token]
echo   - GET %API_URL%/admin/users
echo   - GET %API_URL%/admin/dashboard/stats
echo   - GET %API_URL%/admin/reports
echo.

echo.
echo ===== Testing with PowerShell (Recommended) =====
echo.
echo Use PowerShell for easier JSON handling:
echo.
echo   $token = "your_token_here"
echo   $headers = @{"Authorization" = "Bearer $token"}
echo   Invoke-WebRequest -Uri http://localhost:5000/api/auth/me -Headers $headers | ConvertFrom-Json
echo.

echo.
echo ===== Testing with Postman (Best Option) =====
echo.
echo 1. Download Postman from https://www.postman.com/downloads/
echo 2. Create new requests for each endpoint
echo 3. Set Authorization type to Bearer Token
echo 4. Copy token from login response
echo 5. Test each endpoint individually
echo.

pause
