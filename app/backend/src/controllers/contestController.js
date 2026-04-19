const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงรายการการประกวดทั้งหมด
exports.getContests = async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({
            orderBy: { startDate: 'desc' }
        });
        res.status(200).json({ success: true, data: contests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ตรวจสอบความเหมาะสมและส่งผลงานเข้าประกวด
exports.submitEntry = async (req, res) => {
    try {
        const { contestId, novelId } = req.body;
        const userId = req.user.id;

        // 1. เช็คว่ามีนิยายเรื่องนี้จริงและเป็นของคนนี้
        const novel = await prisma.novel.findFirst({
            where: { id: novelId, authorId: userId },
            include: { _count: { select: { chapters: true } } }
        });

        if (!novel) return res.status(404).json({ message: "ไม่พบนิยายของคุณ" });
        if (novel._count.chapters < 3) return res.status(400).json({ message: "นิยายต้องมีอย่างน้อย 3 ตอนเพื่อเข้าประกวด" });

        // 2. บันทึกข้อมูล
        const entry = await prisma.contestEntry.create({
            data: {
                contestId,
                novelId,
                authorId: userId,
                status: "PENDING"
            }
        });

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: "เรื่องนี้ส่งประกวดไปแล้ว" });
        res.status(500).json({ success: false, message: error.message });
    }
};