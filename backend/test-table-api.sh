#!/bin/bash

# Table Management API Testing Script
# Make sure your backend server is running on localhost:3001

BASE_URL="http://localhost:3001/api/tables"
AUTH_TOKEN="your-jwt-token-here" # Replace with actual token

echo "🧪 Testing Table Management API"
echo "================================="

# Test 1: Get all tables
echo "📋 1. Getting all tables..."
curl -X GET "$BASE_URL" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 2: Create a new table
echo "➕ 2. Creating new table..."
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": "T001",
    "capacity": 4,
    "area": "indoor",
    "location_description": "Near the window with garden view",
    "position_x": 100,
    "position_y": 150
  }' | jq .

echo -e "\n"

# Test 3: Create another table
echo "➕ 3. Creating VIP table..."
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": "VIP01",
    "capacity": 6,
    "area": "vip",
    "location_description": "Private VIP section",
    "position_x": 300,
    "position_y": 200,
    "notes": "Premium table with dedicated waiter"
  }' | jq .

echo -e "\n"

# Test 4: Update table status to occupied
echo "🔄 4. Setting table T001 to occupied..."
TABLE_ID="table-id-from-step-2" # Replace with actual table ID
curl -X PATCH "$BASE_URL/$TABLE_ID/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "occupied",
    "guest_count": 3,
    "customer_name": "John Doe",
    "customer_phone": "081234567890"
  }' | jq .

echo -e "\n"

# Test 5: Make a reservation
echo "📅 5. Making reservation for VIP table..."
VIP_TABLE_ID="vip-table-id-from-step-3" # Replace with actual table ID
curl -X PATCH "$BASE_URL/$VIP_TABLE_ID/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reserved",
    "customer_name": "Jane Smith",
    "customer_phone": "081987654321",
    "guest_count": 4,
    "reserved_from": "'$(date -d '+2 hours' -Iseconds)'",
    "reserved_until": "'$(date -d '+4 hours' -Iseconds)'"
  }' | jq .

echo -e "\n"

# Test 6: Get table statistics
echo "📊 6. Getting table statistics..."
curl -X GET "$BASE_URL/stats" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 7: Get QR code for a table
echo "📱 7. Getting QR code for table..."
curl -X GET "$BASE_URL/$TABLE_ID/qr-code" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 8: Get usage history
echo "📈 8. Getting usage history..."
curl -X GET "$BASE_URL/$TABLE_ID/usage-history" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 9: Get dashboard data
echo "📊 9. Getting dashboard data..."
curl -X GET "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 10: Filter tables by status
echo "🔍 10. Filtering available tables..."
curl -X GET "$BASE_URL?status=available" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 11: Search tables
echo "🔍 11. Searching tables..."
curl -X GET "$BASE_URL?search=VIP" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# Test 12: Update table info
echo "✏️  12. Updating table information..."
curl -X PUT "$BASE_URL/$TABLE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 6,
    "location_description": "Premium window seat with city view",
    "notes": "Upgraded table with better view"
  }' | jq .

echo -e "\n"

# Test 13: Set table to cleaning status
echo "🧹 13. Setting table to cleaning status..."
curl -X PATCH "$BASE_URL/$TABLE_ID/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cleaning",
    "cleaned_by": "Staff Member",
    "notes": "Deep cleaning after busy lunch hour"
  }' | jq .

echo -e "\n"

# Test 14: Set table back to available
echo "✅ 14. Setting table back to available..."
curl -X PATCH "$BASE_URL/$TABLE_ID/status" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "available"
  }' | jq .

echo -e "\n"

echo "🎉 Testing completed!"
echo "============================"
echo "📝 Notes:"
echo "- Replace 'your-jwt-token-here' with actual JWT token"
echo "- Replace table IDs with actual IDs from create responses"
echo "- Make sure backend server is running on localhost:3001"
echo "- Install jq for JSON formatting: brew install jq"
