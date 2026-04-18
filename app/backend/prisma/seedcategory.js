const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const categories = [
    'รักโรแมนติก', 'นิยายวาย (BL/Yaoi)', 'นิยายยูริ (GL/Yuri)', 
    'แฟนตาซี (Fantasy)', 'กำลังภายใน (Wuxia)', 'ระทึกขวัญ/สยองขวัญ',
    'สืบสวนสอบสวน', 'เกิดใหม่/ต่างโลก', 'รักวัยรุ่น', 'ดราม่า',
    'ตลก (Comedy)', 'ย้อนยุค', 'ระบบ/เกมเมอร์'
  ];

  try {
    await client.connect();
    console.log('🔗 เชื่อมต่อฐานข้อมูลสำเร็จ...');

    // 1. ล้างข้อมูลเก่า (เผื่อมีเศษค้าง) เพื่อความสะอาด
    await client.query('TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE;');

    for (let i = 0; i < categories.length; i++) {
      const name = categories[i];
      const id = i + 1; // 👈 กำหนด ID เป็น 1, 2, 3... ไปเลย

      const query = `
        INSERT INTO "Category" ("id", "name") 
        VALUES ($1, $2) 
        ON CONFLICT ("name") DO NOTHING;
      `;
      
      await client.query(query, [id, name]);
      console.log(`✅ บันทึกหมวดหมู่ [${id}]: ${name}`);
    }

    console.log('\n✨ ลงข้อมูลหมวดหมู่ทั้งหมดเรียบร้อยแล้ว!');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.stack);
  } finally {
    await client.end();
  }
}

main();