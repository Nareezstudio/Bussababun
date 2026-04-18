-- 1. ล้างข้อมูลเก่าเพื่อความสะอาด
TRUNCATE TABLE "Promotion", "Novel", "Category", "User" CASCADE;

-- 2. สร้าง User
INSERT INTO "User" (id, username, email, password, role, "updatedAt") 
VALUES ('user-001', 'writer_test', 'test@test.com', 'hashedpassword', 'WRITER', NOW());

-- 3. สร้าง Category (ระบุ ID เป็น 1 ไปเลย)
INSERT INTO "Category" (id, name) 
VALUES (1, 'แฟนตาซี');

-- 4. สร้าง Novel (อ้างอิง categoryId = 1 ให้ตรงกับข้อ 3)
INSERT INTO "Novel" (id, title, "authorId", "categoryId", "updatedAt") 
VALUES ('novel-001', 'ศึกเวทย์มนตร์', 'user-001', 1, NOW());

-- 5. สร้าง Promotion (อ้างอิง novelId = 'novel-001' ให้ตรงกับข้อ 4)
INSERT INTO "Promotion" (id, name, type, "discountType", "discountValue", "startDate", "endDate", "novelId", "updatedAt")
VALUES ('promo-001', 'ลดต้อนรับเปิดเรื่อง', 'FULL', 'PERCENT', 10, NOW(), NOW() + INTERVAL '7 days', 'novel-001', NOW());