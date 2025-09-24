#!/bin/bash

# Test Menu Management Page
# Script untuk testing halaman menu management secara otomatis

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Menu Management Page${NC}"
echo "=================================="

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Frontend tidak berjalan di http://localhost:3000${NC}"
    echo -e "${YELLOW}Jalankan frontend terlebih dahulu: npm start${NC}"
    exit 1
fi

# Check if backend is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${RED}❌ Backend tidak berjalan di http://localhost:5001${NC}"
    echo -e "${YELLOW}Jalankan backend terlebih dahulu: npx ts-node src/server.ts${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend dan Backend sedang berjalan${NC}"

# Test login first
echo -e "\n${BLUE}🔐 Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}')

if [[ $LOGIN_RESPONSE == *"success\":true"* ]]; then
    echo -e "${GREEN}✅ Login berhasil${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Token: ${TOKEN:0:20}...${NC}"
else
    echo -e "${RED}❌ Login gagal${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Open browser untuk testing manual
echo -e "\n${BLUE}🌐 Membuka browser untuk testing...${NC}"

# URLs untuk testing
URLS=(
    "http://localhost:3000/admin/menu"
    "http://localhost:3000/admin/dashboard"
)

echo -e "\n${YELLOW}📋 URLs untuk testing:${NC}"
for url in "${URLS[@]}"; do
    echo -e "   🔗 $url"
done

# Test dengan different user roles
echo -e "\n${BLUE}👥 Testing dengan berbagai role:${NC}"

USERS=(
    "admin:admin123:admin"
    "owner:owner123:owner"
    "kasir:kasir123:kasir"
)

for user_data in "${USERS[@]}"; do
    IFS=':' read -r username password role <<< "$user_data"
    
    echo -e "\n${YELLOW}Testing role: $role${NC}"
    
    RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$username\",\"password\":\"$password\",\"role\":\"$role\"}")
    
    if [[ $RESPONSE == *"success\":true"* ]]; then
        echo -e "${GREEN}✅ Login $role berhasil${NC}"
    else
        echo -e "${RED}❌ Login $role gagal${NC}"
    fi
done

# Test checklist untuk manual testing
echo -e "\n${BLUE}📝 Manual Testing Checklist:${NC}"
echo -e "\n${YELLOW}Login & Navigation:${NC}"
echo "□ Login sebagai admin berhasil"
echo "□ Navigasi ke menu management berhasil"
echo "□ Sidebar menampilkan menu yang tepat"

echo -e "\n${YELLOW}Menu Display:${NC}"
echo "□ Daftar menu tampil dengan benar"
echo "□ Card menu menampilkan foto, nama, harga"
echo "□ Status tersedia/habis tampil"
echo "□ Kategori dan alergen tampil"

echo -e "\n${YELLOW}Search & Filter:${NC}"
echo "□ Search bar berfungsi"
echo "□ Filter kategori berfungsi"
echo "□ Statistics chips update real-time"

echo -e "\n${YELLOW}Add Menu:${NC}"
echo "□ Tombol + floating muncul"
echo "□ Dialog tambah menu terbuka"
echo "□ Upload foto berfungsi"
echo "□ Form validation bekerja"
echo "□ Save menu berhasil"

echo -e "\n${YELLOW}Edit Menu:${NC}"
echo "□ Tombol edit pada card berfungsi"
echo "□ Data existing terload di form"
echo "□ Update menu berhasil"

echo -e "\n${YELLOW}Delete Menu:${NC}"
echo "□ Tombol delete muncul konfirmasi"
echo "□ Hapus menu berhasil"

echo -e "\n${YELLOW}Toggle Status:${NC}"
echo "□ Toggle ketersediaan berfungsi"
echo "□ Status update real-time"

echo -e "\n${YELLOW}Responsive Design:${NC}"
echo "□ Tampilan mobile responsive"
echo "□ Touch interaction berfungsi"
echo "□ Layout tablet optimal"

echo -e "\n${YELLOW}Performance:${NC}"
echo "□ Page load cepat"
echo "□ Smooth animations"
echo "□ No console errors"

# Automated screenshot (jika tersedia)
if command -v screencapture &> /dev/null; then
    echo -e "\n${BLUE}📸 Mengambil screenshot...${NC}"
    screencapture -w ~/Desktop/menu-management-test.png 2>/dev/null || true
    echo -e "${GREEN}Screenshot disimpan di Desktop${NC}"
fi

echo -e "\n${GREEN}🎉 Setup testing selesai!${NC}"
echo -e "\n${BLUE}🔗 Akses Menu Management:${NC}"
echo -e "   ${YELLOW}http://localhost:3000/admin/menu${NC}"
echo -e "\n${BLUE}📖 Login Credentials:${NC}"
echo -e "   Username: ${YELLOW}admin${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}"
echo -e "   Role: ${YELLOW}admin${NC}"

echo -e "\n${BLUE}🛠️  Features untuk ditest:${NC}"
echo -e "   ✨ Tambah menu baru"
echo -e "   ✏️  Edit menu existing"
echo -e "   🗑️  Hapus menu"
echo -e "   🔍 Search dan filter"
echo -e "   📱 Responsive design"
echo -e "   🖼️  Upload foto"
echo -e "   🔄 Toggle status"
