const fs = require('fs');

function replaceQuotes(filePath, findStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.split(findStr).join(replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceQuotes('frontend/src/app/dashboard/staff/page.tsx', '"Tất cả đơn"', '&quot;Tất cả đơn&quot;');
replaceQuotes('frontend/src/app/dashboard/staff/inspection/page.tsx', '"Mòn nhẹ"', '&quot;Mòn nhẹ&quot;');
replaceQuotes('frontend/src/app/dashboard/staff/inspection/page.tsx', '"Hư hỏng nặng"', '&quot;Hư hỏng nặng&quot;');
