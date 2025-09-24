#!/bin/bash

# Test Menu Management Integration Script
# This script will test the menu management integration between frontend and backend

echo "🚀 Testing Menu Management Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3001/api"

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking if backend is running..."
    if curl -s "$API_URL/menus" > /dev/null; then
        echo -e "${GREEN}✅ Backend is running on $API_URL${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not running. Please start the backend server first.${NC}"
        echo "Run: cd backend && npm run dev"
        return 1
    fi
}

# Function to test menu endpoints
test_menu_endpoints() {
    echo "🧪 Testing Menu API Endpoints..."
    
    # Test GET all menus
    echo "1. Testing GET /api/menus"
    response=$(curl -s -w "%{http_code}" "$API_URL/menus")
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ GET /api/menus - Success${NC}"
    else
        echo -e "${RED}❌ GET /api/menus - Failed (HTTP $http_code)${NC}"
    fi
    
    # Test POST create menu
    echo "2. Testing POST /api/menus"
    create_response=$(curl -s -w "%{http_code}" -X POST "$API_URL/menus" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Menu Item",
            "description": "Test description",
            "price": 25000,
            "cost_price": 15000,
            "category": "main_course",
            "is_available": true,
            "prep_time_minutes": 15,
            "allergens": ["gluten"],
            "stock": 50,
            "low_stock_threshold": 10,
            "is_promo_active": false
        }')
    
    http_code="${create_response: -3}"
    if [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ POST /api/menus - Success${NC}"
        # Extract menu ID from response for further tests
        MENU_ID=$(echo "${create_response%???}" | jq -r '.data.menu_id' 2>/dev/null)
        if [ "$MENU_ID" != "null" ] && [ -n "$MENU_ID" ]; then
            echo "   Created menu with ID: $MENU_ID"
        fi
    else
        echo -e "${RED}❌ POST /api/menus - Failed (HTTP $http_code)${NC}"
        echo "   Response: ${create_response%???}"
    fi
    
    # Test GET single menu (if we have an ID)
    if [ -n "$MENU_ID" ] && [ "$MENU_ID" != "null" ]; then
        echo "3. Testing GET /api/menus/$MENU_ID"
        single_response=$(curl -s -w "%{http_code}" "$API_URL/menus/$MENU_ID")
        http_code="${single_response: -3}"
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ GET /api/menus/:id - Success${NC}"
        else
            echo -e "${RED}❌ GET /api/menus/:id - Failed (HTTP $http_code)${NC}"
        fi
        
        # Test PUT update menu
        echo "4. Testing PUT /api/menus/$MENU_ID"
        update_response=$(curl -s -w "%{http_code}" -X PUT "$API_URL/menus/$MENU_ID" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "Updated Test Menu Item",
                "price": 30000
            }')
        
        http_code="${update_response: -3}"
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ PUT /api/menus/:id - Success${NC}"
        else
            echo -e "${RED}❌ PUT /api/menus/:id - Failed (HTTP $http_code)${NC}"
        fi
        
        # Test PATCH toggle availability
        echo "5. Testing PATCH /api/menus/$MENU_ID/toggle-availability"
        toggle_response=$(curl -s -w "%{http_code}" -X PATCH "$API_URL/menus/$MENU_ID/toggle-availability")
        http_code="${toggle_response: -3}"
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ PATCH /api/menus/:id/toggle-availability - Success${NC}"
        else
            echo -e "${RED}❌ PATCH /api/menus/:id/toggle-availability - Failed (HTTP $http_code)${NC}"
        fi
        
        # Test DELETE menu
        echo "6. Testing DELETE /api/menus/$MENU_ID"
        delete_response=$(curl -s -w "%{http_code}" -X DELETE "$API_URL/menus/$MENU_ID")
        http_code="${delete_response: -3}"
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✅ DELETE /api/menus/:id - Success${NC}"
        else
            echo -e "${RED}❌ DELETE /api/menus/:id - Failed (HTTP $http_code)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Skipping single menu tests (no menu ID available)${NC}"
    fi
}

# Function to test category endpoints
test_category_endpoints() {
    echo "🏷️  Testing Category API Endpoints..."
    
    # Test GET categories
    echo "1. Testing GET /api/menus/categories/all"
    response=$(curl -s -w "%{http_code}" "$API_URL/menus/categories/all")
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ GET /api/menus/categories/all - Success${NC}"
    else
        echo -e "${RED}❌ GET /api/menus/categories/all - Failed (HTTP $http_code)${NC}"
    fi
    
    # Test POST create category
    echo "2. Testing POST /api/menus/categories"
    create_response=$(curl -s -w "%{http_code}" -X POST "$API_URL/menus/categories" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Category",
            "description": "Test category description",
            "icon": "RestaurantIcon"
        }')
    
    http_code="${create_response: -3}"
    if [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ POST /api/menus/categories - Success${NC}"
    else
        echo -e "${RED}❌ POST /api/menus/categories - Failed (HTTP $http_code)${NC}"
    fi
}

# Function to test menu stats
test_stats_endpoint() {
    echo "📊 Testing Stats API Endpoint..."
    
    response=$(curl -s -w "%{http_code}" "$API_URL/menus/stats")
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ GET /api/menus/stats - Success${NC}"
        # Display stats if available
        stats_data="${response%???}"
        if command -v jq &> /dev/null; then
            echo "   Stats data:"
            echo "$stats_data" | jq '.data' 2>/dev/null || echo "   $stats_data"
        fi
    else
        echo -e "${RED}❌ GET /api/menus/stats - Failed (HTTP $http_code)${NC}"
    fi
}

# Function to check frontend connection
check_frontend() {
    echo "🌐 Checking Frontend Connection..."
    if curl -s "http://localhost:3000" > /dev/null; then
        echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
        echo "   You can test the integrated menu page at: http://localhost:3000/admin/menu"
    else
        echo -e "${YELLOW}⚠️  Frontend is not running. To start:${NC}"
        echo "   cd frontend && npm start"
    fi
}

# Function to display setup instructions
show_setup_instructions() {
    echo ""
    echo "📋 Setup Instructions:"
    echo "1. Start Backend Server:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "2. Start Frontend Server:"
    echo "   cd frontend && npm start"
    echo ""
    echo "3. Test the Integration:"
    echo "   - Open http://localhost:3000/admin/menu"
    echo "   - Try adding, editing, and deleting menu items"
    echo "   - Check that changes persist in the database"
    echo ""
    echo "4. Check Database:"
    echo "   - Verify menu data is saved in your database"
    echo "   - Check menu_categories table for categories"
    echo ""
}

# Main execution
main() {
    echo "🍽️  Menu Management Integration Test"
    echo "====================================="
    echo ""
    
    # Check if backend is running
    if check_backend; then
        echo ""
        test_menu_endpoints
        echo ""
        test_category_endpoints
        echo ""
        test_stats_endpoint
        echo ""
        check_frontend
        echo ""
        echo -e "${GREEN}🎉 Integration test completed!${NC}"
    else
        echo ""
        show_setup_instructions
        exit 1
    fi
    
    echo ""
    echo "📝 Next Steps:"
    echo "- Replace MenuPage with MenuPageIntegrated in your routes"
    echo "- Test all CRUD operations through the UI"
    echo "- Verify real-time synchronization with database"
    echo "- Check error handling and user feedback"
    echo ""
    echo "🔗 Documentation: ./MENU_INTEGRATION_README.md"
}

# Run the main function
main
