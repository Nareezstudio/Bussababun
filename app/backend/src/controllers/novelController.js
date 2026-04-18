const prisma = require('../lib/prisma');

// ==========================================
// 🌍 1. PUBLIC ROUTES
// ==========================================

exports.getAllNovels = async (req, res) => {
    try {
        const novels = await prisma.novel.findMany({
            include: {
                category: true,
                author: { select: { username: true, penName: true, profileImage: true } },
                _count: { select: { chapters: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(novels);
    } catch (error) {
        res.status(500).json({ message: "ดึงข้อมูลนิยายล้มเหลว" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
        res.json({ success: true, data: cats }); 
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

exports.getNovelsByCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) return res.status(404).json({ message: "ไม่พบหมวดหมู่" });

        const novels = await prisma.novel.findMany({
            where: { categoryId },
            include: {
                category: true,
                author: { select: { username: true, penName: true } },
                _count: { select: { chapters: true } }
            }
        });
        res.json({ categoryName: category.name, novels });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.getPromotedNovels = async (req, res) => {
    try {
        const now = new Date();
        const promoted = await prisma.novel.findMany({
            where: { promotions: { some: { startDate: { lte: now }, endDate: { gte: now }, isActive: true } } },
            include: { author: { select: { penName: true } }, promotions: true, _count: { select: { chapters: true } } },
            take: 10
        });
        res.json(promoted);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// ==========================================
// 📖 2. NOVEL & CHAPTER DETAILS
// ==========================================

// ✅ 1. เพิ่มฟังก์ชัน updateNovel (ที่หายไปจนทำให้เกิด 404)
// ฟังก์ชันสำหรับอัปเดตนิยาย (แก้อาการ 404)
exports.updateNovel = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, categoryId, status } = req.body;

        // 1. ตรวจสอบว่านิยายเรื่องนี้มีอยู่จริงและเป็นของคนแก้หรือไม่
        const novel = await prisma.novel.findUnique({ where: { id } });
        
        if (!novel) return res.status(404).json({ message: "ไม่พบข้อมูลนิยาย" });
        if (novel.authorId !== req.user.id) return res.status(403).json({ message: "คุณไม่มีสิทธิ์แก้ไขนิยายเรื่องนี้" });

        // 2. ทำการอัปเดตข้อมูล
        const updated = await prisma.novel.update({
            where: { id },
            data: {
                title,
                description,
                status,
                categoryId: categoryId ? parseInt(categoryId) : undefined
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลได้" });
    }
};

// ✅ 2. แก้ไข getNovelById (เพื่อให้ดึงข้อมูลไปแสดงในหน้า Edit ได้ถูกต้อง)
exports.getNovelById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const now = new Date();

        const novel = await prisma.novel.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
            include: {
                category: true,
                author: { select: { id: true, penName: true, profileImage: true } },
                promotions: { where: { startDate: { lte: now }, endDate: { gte: now }, isActive: true } },
                chapters: {
                    orderBy: { chapterNumber: 'asc' },
                }
            }
        });

        // ส่งข้อมูลกลับไปในรูปแบบ { success: true, data: novel } 
        // เพื่อให้ตรงกับโครงสร้างที่ Frontend รอรับ (res.data.data)
        res.json({ success: true, data: novel }); 
    } catch (error) {
        res.status(500).json({ message: "ไม่พบข้อมูลนิยาย" });
    }
};

// ✅ 3. แก้ไข getMyNovels (ให้ส่งค่าเหมือนเดิมแต่เพิ่มความปลอดภัย)
exports.getMyNovels = async (req, res) => {
    try {
        const my = await prisma.novel.findMany({ 
            where: { authorId: req.user.id }, 
            include: { category: true, _count: true },
            orderBy: { updatedAt: 'desc' } // เรียงเรื่องที่แก้ล่าสุดขึ้นก่อน
        });
        res.json(my);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.getChapterDetail = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const userId = req.user?.id;

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { novel: true }
        });

        if (!chapter) return res.status(404).json({ message: "ไม่พบตอน" });

        const isAuthor = userId === chapter.novel.authorId;
        if (chapter.price > 0 && !isAuthor) {
            if (!userId) return res.status(401).json({ message: "Login required" });
            const purchase = await prisma.purchase.findUnique({ where: { userId_chapterId: { userId, chapterId } } });
            if (!purchase) return res.status(403).json({ message: "Please purchase", chapter: { title: chapter.title, price: chapter.price } });
        }

        if (userId) {
            await prisma.readingHistory.upsert({
                where: { userId_chapterId: { userId, chapterId } },
                update: { updatedAt: new Date() },
                create: { userId, chapterId, novelId: chapter.novelId }
            }).catch(() => {});
        }

        res.json({ chapter });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// ==========================================
// 💰 3. TRANSACTIONS & SOCIAL
// ==========================================

exports.purchaseChapter = async (req, res) => {
    try {
        const { chapterId } = req.body;
        const userId = req.user.id;

        const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { novel: true } });
        if (!chapter || chapter.price <= 0) return res.status(400).json({ message: "Free chapter" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.coins < chapter.price) return res.status(400).json({ message: "Insufficient coins" });

        // --- แบ่งรายได้ 60/40 ---
        const authorEarnings = Math.floor(chapter.price * 0.6);

        await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { coins: { decrement: chapter.price } } }),
            prisma.purchase.create({ data: { userId, chapterId, amount: chapter.price } }),
            prisma.user.update({ where: { id: chapter.novel.authorId }, data: { earnings: { increment: authorEarnings } } })
        ]);

        res.json({ success: true, paid: chapter.price });
    } catch (error) {
        res.status(500).json({ message: "Purchase failed" });
    }
};

// ✅ ระบบติดตามนิยาย (Follow) + เพิ่มเข้าชั้นหนังสือ (Library) ในตัวเดียว
exports.toggleFollow = async (req, res) => {
    try {
        const novelId = req.params.id;
        const userId = req.user.id;

        // 1. ตรวจสอบว่าเคยติดตามไว้หรือยัง
        const existingFollow = await prisma.follow.findFirst({
            where: { userId, novelId },
        });

        if (existingFollow) {
            // 2. ถ้ามีอยู่แล้ว -> ลบออก (Unfollow / Remove from Library)
            await prisma.follow.delete({
                where: { id: existingFollow.id },
            });
            return res.json({ 
                success: true, 
                isFollowing: false, 
                message: "นำออกจากชั้นหนังสือเรียบร้อยแล้ว" 
            });
        } else {
            // 3. ถ้ายังไม่มี -> เพิ่มเข้าไป (Follow / Add to Library)
            await prisma.follow.create({
                data: { userId, novelId },
            });
            return res.json({ 
                success: true, 
                isFollowing: true, 
                message: "เพิ่มเข้านิยายเรื่องโปรดในชั้นหนังสือแล้ว" 
            });
        }
    } catch (error) {
        console.error("ToggleFollow Error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการจัดการชั้นหนังสือ" });
    }
};

// ==========================================
// ✍️ 4. AUTHOR ACTIONS (กู้คืนครบทุกฟังก์ชัน)
// ==========================================

exports.createNovel = async (req, res) => {
    try {
        const { title, description, categoryId } = req.body;
        const novel = await prisma.novel.create({
            data: { title, description, categoryId: parseInt(categoryId), authorId: req.user.id, coverImage: req.file?.path }
        });
        res.status(201).json({ success: true, novel });
    } catch (error) {
        res.status(500).json({ message: "Create failed" });
    }
};

exports.addChapter = async (req, res) => {
    try {
        const { id: novelId } = req.params;
        const count = await prisma.chapter.count({ where: { novelId } });
        const chapter = await prisma.chapter.create({
            data: { 
                title: req.body.title, 
                content: req.body.content, 
                price: parseInt(req.body.price) || 0,
                novelId, 
                chapterNumber: count + 1 
            }
        });
        res.status(201).json(chapter);
    } catch (error) {
        res.status(500).json({ message: "Add chapter failed" });
    }
};


// ✅ ดึงรายชื่อนิยายในชั้นหนังสือ (เรียงตามการอัปเดตตอนล่าสุด)
exports.getMyFollowedNovels = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. ดึงข้อมูลการติดตาม (Follow) ของ user
        const followed = await prisma.follow.findMany({
            where: { userId: userId },
            include: {
                novel: {
                    include: {
                        author: {
                            select: { penName: true, profileImage: true }
                        },
                        category: true,
                        // ดึงตอนล่าสุดออกมา 1 ตอนเพื่อใช้ดูเวลาอัปเดต
                        chapters: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        },
                        _count: {
                            select: { chapters: true }
                        }
                    }
                }
            }
        });

        // 2. แปลงข้อมูลและจัดการเรื่องการเรียงลำดับ (Sorting)
        const bookshelf = followed.map(f => {
            const lastChapter = f.novel.chapters[0]; // ตอนที่เพิ่งอัปเดตล่าสุด
            return {
                ...f.novel,
                lastUpdated: lastChapter ? lastChapter.createdAt : f.novel.updatedAt,
                chapterCount: f.novel._count.chapters
            };
        });

        // 3. เรียงลำดับ: เรื่องไหนที่มี lastUpdated ใหม่กว่า (ค่ามากกว่า) ให้ขึ้นก่อน
        bookshelf.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        res.json({
            success: true,
            data: bookshelf
        });

    } catch (error) {
        console.error("Get Bookshelf Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "ไม่สามารถดึงข้อมูลชั้นหนังสือได้" 
        });
    }
};

// --- แก้ Error: argument handler must be a function ---
exports.getChapterForEdit = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { novel: true } });
        if (!chapter || chapter.novel.authorId !== req.user.id) return res.status(403).json({ message: "No permission" });
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { title, content, price } = req.body;
        await prisma.chapter.update({ where: { id: chapterId }, data: { title, content, price: parseInt(price) || 0 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.deleteChapter = async (req, res) => {
    try {
        await prisma.chapter.delete({ where: { id: req.params.chapterId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

exports.getChaptersByNovel = async (req, res) => {
    try {
        const chapters = await prisma.chapter.findMany({ where: { novelId: req.params.id }, orderBy: { chapterNumber: 'asc' } });
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.toggleRecommended = async (req, res) => {
    try {
        const { status } = req.body;
        await prisma.novel.update({ where: { id: req.params.id }, data: { isRecommended: status } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.searchNovels = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });
        const novels = await prisma.novel.findMany({
            where: { title: { contains: q, mode: 'insensitive' } },
            include: { category: true, author: { select: { penName: true } } }
        });
        res.json({ success: true, data: novels });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};