const { PrismaClient } = require('@prisma/client');

/**
 * ✅ Singleton Pattern สำหรับ Prisma 5
 * ป้องกันการสร้าง Connection Pool ซ้ำซ้อนเวลาทำ Hot Reload ในโหมด Development
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    // ไม่ต้องมี adapter แล้วครับ Prisma 5 จัดการให้เองผ่าน DATABASE_URL
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;