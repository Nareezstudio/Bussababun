INSERT INTO "Category" ("name") 
VALUES 
('รักโรแมนติก'),
('นิยายวาย (BL/Yaoi)'),
('นิยายยูริ (GL/Yuri)'),
('แฟนตาซี (Fantasy)'),
('กำลังภายใน (Wuxia)'),
('ระทึกขวัญ/สยองขวัญ'),
('สืบสวนสอบสวน'),
('เกิดใหม่/ต่างโลก'),
('รักวัยรุ่น'),
('ดราม่า'),
('ตลก (Comedy)'),
('ย้อนยุค'),
('ระบบ/เกมเมอร์')
ON CONFLICT ("name") DO NOTHING;

การรัน seed.js
วิธีการรัน Seed
ติดตั้งไฟล์: วางโค้ดไว้ใน prisma/seed.js

ตั้งค่า package.json: ตรวจสอบว่าในไฟล์ package.json ของคุณมีส่วนนี้อยู่ (ถ้ายังไม่มีให้เพิ่มเข้าไป):

JSON
"prisma": {
  "seed": "node prisma/seed.js"
}
รันคำสั่ง:

Bash
npx prisma db seed