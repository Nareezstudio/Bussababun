const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ✅ ใช้ PrismaClient แบบปกติ (ไม่ต้องส่ง Adapter เข้าไป)
// Prisma จะอ่าน DATABASE_URL หรือ DIRECT_URL จาก .env ให้เองอัตโนมัติ
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 กำลังเริ่มต้นการ Seed ข้อมูล...');

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin782465@', saltRounds);
  const writerPassword = await bcrypt.hash('writer1234', saltRounds);
  const readerPassword = await bcrypt.hash('reader1234', saltRounds);

  // 1. สร้างหมวดหมู่ (ใช้ upsert เพื่อป้องกันชื่อซ้ำ)
  const categories = [
    'รักหวานแหวว', 'รักจีนโบราณ', 'แฟนตาซี', 'กำลังภายใน (Wuxia)', 
    'สยองขวัญ', 'ระทึกขวัญ', 'วาย (Yaoi)', 'ยูริ (Yuri)', 
    'สืบสวนสอบสวน', 'ไซไฟ (Sci-Fi)', 'ดราม่า', 'ระบบ/ต่างโลก', 
    'อีโรติก 18+', 'อีโรติก 25+'
  ];

  console.log('📂 สร้างหมวดหมู่...');
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const allCats = await prisma.category.findMany();

  // 2. สร้าง User (แก้จาก APPROVED เป็น VERIFIED ตาม Schema)
  console.log('👥 สร้างผู้ใช้งานตัวอย่าง...');
  const admin = await prisma.user.upsert({
    where: { email: 'nareezstudio@outlook.com' },
    update: {},
    create: {
      username: 'AdminBoss',
      email: 'nareezstudio@outlook.com',
      password: adminPassword,
      role: 'ADMIN',
      verification: 'VERIFIED' // ✅ แก้ไขให้ตรง Enum
    }
  });

  const writer = await prisma.user.upsert({
    where: { email: 'testbussababun@gmail.com' },
    update: {},
    create: {
      username: 'นามปากกาใจดี',
      penName: 'ใจดีสตูดิโอ',
      email: 'testbussababun@gmail.com',
      password: writerPassword,
      role: 'WRITER',
      verification: 'VERIFIED', // ✅ แก้ไขให้ตรง Enum
      income: 1500.0,
      earnings: 900.0
    }
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@test.com' },
    update: {},
    create: {
      username: 'นักอ่านนิรนาม',
      email: 'reader@test.com',
      password: readerPassword,
      role: 'READER',
      coins: 500
    }
  });

  // 3. สร้างนิยาย (เช็คก่อนสร้างเพื่อป้องกันข้อมูลซ้ำ)
  console.log('📚 สร้างนิยายตัวอย่าง...');
  const novelData = [
    { title: 'ลิขิตรักจอมใจอสูร', desc: 'เรื่องราวความรักท่ามกลางสงครามระหว่างเผ่าพันธุ์' },
    { title: 'ระบบซุปตาร์หลังวันสิ้นโลก', desc: 'เมื่อไอดอลต้องเอาชีวิตรอดในโลกที่เต็มไปด้วยซอมบี้' },
    { title: 'ท่านอ๋อง... ข้าแค่อยากขายขนม', desc: 'ทะลุมิติมาเป็นแม่ค้าขนมหวานแต่ดันไปเตะตาเจ้าเมือง' }
  ];

  for (let i = 0; i < novelData.length; i++) {
    // เช็คว่ามีนิยายชื่อนี้หรือยัง
    const existingNovel = await prisma.novel.findFirst({
      where: { title: novelData[i].title }
    });

    if (!existingNovel) {
      await prisma.novel.create({
        data: {
          title: novelData[i].title,
          description: novelData[i].desc,
          status: 'ONGOING',
          viewCount: Math.floor(Math.random() * 5000),
          isRecommended: i === 0,
          authorId: writer.id,
          categoryId: allCats[i % allCats.length].id,
          chapters: {
            create: [
              { title: 'บทนำ', content: 'เนื้อหาบทนำ...', chapterNumber: 1, isPublished: true, price: 0 },
              { title: 'ตอนที่ 1', content: 'เนื้อหาตอนที่ 1...', chapterNumber: 2, isPublished: true, price: 3 },
            ]
          }
        }
      });
    }
  }

  // 4. ตั้งค่าระบบ
  console.log('⚙️ ตั้งค่าระบบ...');
  await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: { siteName: "Bussababun Universe" },
    create: {
      id: 1,
      siteName: "Bussababun Universe",
      writerShare: 60.0,
      systemShare: 40.0
    }
  });

  console.log('✅ Seed สำเร็จ!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });