#!/bin/bash
echo "=========================================="
echo "  DEBUG SHIPPING FEE - GoGoDuk & Booking"
echo "=========================================="

BACKEND="http://localhost:4000/api"
FRONTEND="http://localhost:3000"

echo ""
echo "1️⃣  Backend đang chạy không?"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BACKEND/health" 2>/dev/null || echo "❌ Backend KHÔNG chạy trên port 4000"

echo ""
echo "2️⃣  Frontend đang chạy không?"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$FRONTEND" 2>/dev/null || echo "❌ Frontend KHÔNG chạy trên port 3000"

echo ""
echo "3️⃣  API store-info (địa chỉ + tọa độ atelier):"
curl -s "$BACKEND/locations/store-info" | python3 -m json.tool 2>/dev/null || echo "❌ Lỗi"

echo ""
echo "4️⃣  DB: Danh sách địa chỉ khách hàng:"
echo "   (chạy node script để lấy)"
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.address.findMany({select:{id:true,receiverName:true,line1:true,ward:true,district:true,city:true}}).then(a=>{
  a.forEach((x,i)=>console.log('   '+(i+1)+'.',x.receiverName,'|',[x.line1,x.ward,x.district,x.city].filter(Boolean).join(', '),'| ID:',x.id.substring(0,8)+'...'));
  p.\$disconnect();
}).catch(e=>console.log('❌',e.message));
"

echo ""
echo "5️⃣  DB: System settings (store_lat, store_lng, shipping_rate):"
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.systemSetting.findMany({where:{key:{in:['store_lat','store_lng','shipping_rate_per_km','store_address','store_phone','business_hours']}}}).then(s=>{
  if(s.length===0) console.log('   ❌ KHÔNG CÓ settings nào trong DB!');
  s.forEach(x=>console.log('   ',x.key,'=',JSON.stringify(x.value)));
  p.\$disconnect();
}).catch(e=>console.log('❌',e.message));
"

echo ""
echo "6️⃣  Test shipping-fee API với địa chỉ đầu tiên trong DB:"
ADDRESS_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
new PrismaClient().address.findFirst({select:{id:true}}).then(a=>{console.log(a?.id||'');process.exit(0);});
" 2>/dev/null)
if [ -n "$ADDRESS_ID" ]; then
  echo "   Testing addressId: $ADDRESS_ID"
  curl -s "$BACKEND/locations/shipping-fee?addressId=$ADDRESS_ID" | python3 -m json.tool 2>/dev/null
else
  echo "   ❌ Không tìm thấy địa chỉ nào trong DB"
fi

echo ""
echo "=========================================="
echo "  DEBUG COMPLETE - GỬI TOÀN BỘ OUTPUT NÀY"
echo "=========================================="
