const prisma = require('../lib/prisma');

/**
 * ✅ 1. ดึงรายละเอียดตอนนิยายสำหรับอ่าน (Get Chapter Detail)
 */
exports.getChapterDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const now = new Date();

        const chapter = await prisma.chapter.findUnique({
            where: { id },
            include: {
                novel: {
                    include: {
                        promotions: {
                            where: {
                                startDate: { lte: now },
                                endDate: { gte: now },
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!chapter) return res.status(404).json({ message: "ไม่พบเนื้อหาตอนนิยาย" });

        const isOwner = userId && userId === chapter.novel.authorId;

        if (!chapter.isPublished && !isOwner) {
            return res.status(403).json({ message: "ตอนนิยายนี้ยังไม่เปิดให้เข้าชม" });
        }

        let promoPrice = null;
        let promoExpiry = null;
        const activePromo = chapter.novel.promotions[0];

        if (activePromo && chapter.price > 0) {
            promoExpiry = activePromo.endDate;
            if (activePromo.discountType === "PERCENT") {
                promoPrice = Math.max(0, Math.floor(chapter.price - (chapter.price * (activePromo.discountValue / 100))));
            } else {
                promoPrice = Math.max(0, Math.floor(chapter.price - activePromo.discountValue));
            }
        }

        const allChapters = await prisma.chapter.findMany({
            where: { 
                novelId: chapter.novelId,
                ...(isOwner ? {} : { isPublished: true })
            },
            orderBy: { chapterNumber: 'asc' },
            select: { id: true, price: true, chapterNumber: true }
        });

        const currentIndex = allChapters.findIndex(c => c.id === id);
        const prevChapterId = allChapters[currentIndex - 1]?.id || null;
        const nextChapterId = allChapters[currentIndex + 1]?.id || null;
        const isNextLocked = allChapters[currentIndex + 1] ? allChapters[currentIndex + 1].price > 0 : false;

        const isFree = chapter.price === 0;
        let hasPurchased = false;

        if (userId && !isFree && !isOwner) {
            const purchase = await prisma.purchase.findUnique({
                where: { userId_chapterId: { userId, chapterId: id } }
            });
            if (purchase) hasPurchased = true;
        }

        if (!isFree && !isOwner && !hasPurchased) {
            const { content, ...headerOnly } = chapter; 
            return res.status(403).json({
                message: "กรุณาปลดล็อกเพื่ออ่านเนื้อหา",
                chapter: {
                    ...headerOnly,
                    novelId: chapter.novelId,
                    price: chapter.price,
                    promotionPrice: promoPrice,
                    promotionExpiry: promoExpiry
                },
                isLocked: true,
                prevChapterId,
                nextChapterId,
                isNextLocked
            });
        }

        if (userId) {
            await prisma.readingHistory.upsert({
                where: { userId_chapterId: { userId, chapterId: id } },
                update: { updatedAt: new Date() },
                create: { userId, chapterId: id, novelId: chapter.novelId }
            });
        }

        const { novel, ...chapterData } = chapter;
        res.json({
            chapter: {
                ...chapterData,
                novelId: novel.id,
                promotionPrice: promoPrice,
                promotionExpiry: promoExpiry,
                isPurchased: true 
            },
            prevChapterId,
            nextChapterId,
            isNextLocked
        });
    } catch (error) {
        console.error("getChapterDetail Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * ✅ 2. ซื้อตอนนิยาย (Purchase Chapter)
 */
exports.purchaseChapter = async (req, res) => {
    try {
        const { chapterId } = req.body;
        const userId = req.user.id;
        const now = new Date();

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { novel: { include: { promotions: { where: { startDate: { lte: now }, endDate: { gte: now }, isActive: true } } } } }
        });

        if (!chapter) return res.status(404).json({ message: "ไม่พบตอนนิยาย" });
        if (chapter.price <= 0) return res.status(400).json({ message: "ตอนนี้อ่านฟรี" });

        const existingPurchase = await prisma.purchase.findUnique({
            where: { userId_chapterId: { userId, chapterId } }
        });
        if (existingPurchase) return res.status(200).json({ success: true, message: "ปลดล็อกแล้ว" });

        let finalPrice = chapter.price;
        const activePromo = chapter.novel.promotions[0];
        if (activePromo) {
            if (activePromo.discountType === "PERCENT") {
                finalPrice = Math.max(0, Math.floor(chapter.price - (chapter.price * (activePromo.discountValue / 100))));
            } else {
                finalPrice = Math.max(0, Math.floor(chapter.price - activePromo.discountValue));
            }
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.coins < finalPrice) return res.status(400).json({ message: "เหรียญไม่พอ" });

        const writerRevenue = Math.floor(finalPrice * 0.7);
        const systemFee = finalPrice - writerRevenue;

        await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { coins: { decrement: finalPrice } } }),
            prisma.user.update({ where: { id: chapter.novel.authorId }, data: { earnings: { increment: writerRevenue } } }),
            prisma.purchase.create({ 
                data: { 
                    userId, chapterId, amount: finalPrice, fullPrice: chapter.price,
                    writerShare: writerRevenue, systemShare: systemFee, sharePercentage: 70.0
                } 
            })
        ]);

        res.json({ success: true, paidAmount: finalPrice });
    } catch (error) {
        res.status(500).json({ message: "การซื้อล้มเหลว" });
    }
};

/**
 * ✅ 3. สร้างตอนนิยาย (Create Chapter)
 */
exports.createChapter = async (req, res) => {
    try {
        const { novelId, title, content, price, isPublished } = req.body;
        const userId = req.user.id;
        const isPublishedBool = isPublished === true || isPublished === 'true';

        const novel = await prisma.novel.findUnique({ where: { id: novelId } });
        if (!novel || novel.authorId !== userId) return res.status(403).json({ message: "ไม่มีสิทธิ์" });

        const result = await prisma.$transaction(async (tx) => {
            const lastChapter = await tx.chapter.findFirst({
                where: { novelId },
                orderBy: { chapterNumber: 'desc' }
            });
            const nextNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

            const newChapter = await tx.chapter.create({
                data: { 
                    novelId, title, content, 
                    chapterNumber: nextNumber, 
                    price: parseInt(price) || 0, 
                    isPublished: isPublishedBool 
                }
            });

            if (isPublishedBool) await sendUpdateNotification(tx, novelId, novel.title, newChapter);
            return newChapter;
        });

        res.status(201).json({ success: true, chapter: result });
    } catch (error) {
        res.status(500).json({ message: "สร้างตอนล้มเหลว" });
    }
};

/**
 * ✅ 4. อัปเดตตอน (Update Chapter) - ปรับปรุงใหม่
 */
exports.updateChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { title, content, price, isPublished } = req.body;
        const userId = req.user.id;

        // แปลงค่าให้เป็น Boolean ชัดเจน
        const isPublishedBool = isPublished === true || isPublished === 'true';

        console.log(`🚀 Updating Chapter: ${chapterId} | isPublished: ${isPublishedBool}`);

        const chapter = await prisma.chapter.findUnique({ 
            where: { id: chapterId }, 
            include: { novel: true } 
        });

        if (!chapter || chapter.novel.authorId !== userId) {
            return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไข" });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const updatedChapter = await tx.chapter.update({
                where: { id: chapterId },
                data: { 
                    title, 
                    content, 
                    price: price !== undefined ? parseInt(price) : undefined, 
                    isPublished: isPublishedBool 
                }
            });

            // แจ้งเตือนเมื่อเปลี่ยนจาก Draft เป็น Published ครั้งแรก
            if (!chapter.isPublished && isPublishedBool) {
                await sendUpdateNotification(tx, chapter.novelId, chapter.novel.title, updatedChapter);
            }
            return updatedChapter;
        });

        res.json({ success: true, chapter: updated });
    } catch (error) {
        console.error("Update Chapter Error:", error);
        res.status(500).json({ message: "Update ล้มเหลว" });
    }
};

/**
 * ✅ 5. ดึงข้อมูลเพื่อแก้ไข
 */
exports.getChapterForEdit = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const userId = req.user.id;
        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { novel: { select: { authorId: true } } }
        });
        if (!chapter || chapter.novel.authorId !== userId) return res.status(403).json({ message: "ไม่มีสิทธิ์" });
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ message: "ดึงข้อมูลล้มเหลว" });
    }
};

/**
 * ✅ 6. ลบตอนนิยาย
 */
exports.deleteChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const userId = req.user.id;
        const chapter = await prisma.chapter.findUnique({ 
            where: { id: chapterId }, 
            include: { novel: true } 
        });
        if (!chapter || chapter.novel.authorId !== userId) return res.status(403).json({ message: "ไม่มีสิทธิ์" });
        await prisma.chapter.delete({ where: { id: chapterId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Delete ล้มเหลว" });
    }
};

/**
 * ✅ 7. จัดลำดับตอนใหม่
 */
exports.reorderChapters = async (req, res) => {
    try {
        const { novelId } = req.params;
        const { orders } = req.body;
        const userId = req.user.id;
        const novel = await prisma.novel.findUnique({ where: { id: novelId } });
        if (!novel || novel.authorId !== userId) return res.status(403).json({ message: "ไม่มีสิทธิ์" });

        await prisma.$transaction(
            orders.map((item) =>
                prisma.chapter.update({
                    where: { id: item.id },
                    data: { chapterNumber: parseInt(item.chapterNumber) },
                })
            )
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Reorder ล้มเหลว" });
    }
};

async function sendUpdateNotification(tx, novelId, novelTitle, chapter) {
    const followers = await tx.follow.findMany({
        where: { novelId },
        select: { userId: true }
    });
    if (followers.length > 0) {
        await tx.notification.createMany({
            data: followers.map(f => ({
                userId: f.userId,
                title: `ตอนใหม่มาแล้ว! 📖`,
                message: `นิยายเรื่อง "${novelTitle}" อัปเดตตอนที่ ${chapter.chapterNumber}: ${chapter.title}`,
                type: 'UPDATE'
            }))
        });
    }
}