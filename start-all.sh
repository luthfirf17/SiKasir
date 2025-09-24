#!/bin/bash

# Function to run commands in new terminal tabs (macOS)
run_in_new_tab() {
    local cmd="$1"
    local title="$2"
    
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$PROJECT_ROOT' && $cmd\"
        set custom title of front window to \"$title\"
    end tell
    "
}

echo "🚀 Starting KasirKu Full Stack Application..."
echo "This will open new terminal tabs for backend and frontend"

# Start backend in new tab
run_in_new_tab "./start-backend.sh" "KasirKu Backend"

# Wait a bit for backend to start
sleep 3

# Start frontend in new tab  
run_in_new_tab "./start-frontend.sh" "KasirKu Frontend"

echo ""
echo "🎉 Applications starting in separate terminal tabs!"
echo "📋 Access Points:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔌 Backend:  http://localhost:5000"
echo "   📊 Health:   http://localhost:5000/health"
echo ""
echo "📝 Default Admin Login (akan dibuat otomatis):"
echo "   Email: admin@kasirku.com"
echo "   Password: admin123"
