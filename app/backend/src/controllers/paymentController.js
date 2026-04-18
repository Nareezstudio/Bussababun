const prisma = require('../lib/prisma');
const crypto = require('crypto');
const axios = require('axios');

/**
 * 1. ฟังก์ชันซื้อตอนนิยาย (จ่ายด้วย Coins)
 */
exports.buyChapter = async (req, res) => {
    const { chapterId } = req.body;
    const userId = req.user.id;

    if (!chapterId) {
        return res.status(400).json({ message: "กรุณาระบุตอนนิยายที่ต้องการซื้อ" });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const chapter = await tx.chapter.findUnique({
                where: { id: chapterId },
                include: { novel: { select: { authorId: true } } }
            });

            if (!chapter) throw new Error("ไม่พบตอนนิยาย");
            if (chapter.price <= 0) throw new Error("ตอนนี้อ่านฟรี ไม่ต้องซื้อ");

            const settings = await tx.systemSetting.findFirst({ where: { id: 1 } });
            const writerPercent = settings ? settings.writerShare : 60;
            const systemPercent = settings ? settings.systemShare : 40;

            const alreadyPurchased = await tx.purchase.findUnique({
                where: { userId_chapterId: { userId, chapterId } }
            });
            if (alreadyPurchased) throw new Error("คุณเคยซื้อตอนนี้ไปแล้ว");

            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.coins < chapter.price) throw new Error("เหรียญของคุณไม่พอ");

            const writerAmount = (chapter.price * writerPercent) / 100;
            const systemAmount = (chapter.price * systemPercent) / 100;

            await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: chapter.price } }
            });

            await tx.user.update({
                where: { id: chapter.novel.authorId },
                data: { income: { increment: writerAmount } }
            });

            return await tx.purchase.create({
                data: {
                    userId,
                    chapterId,
                    amount: chapter.price,
                    writerShare: writerAmount,
                    systemShare: systemAmount,
                    sharePercentage: writerPercent
                }
            });
        });

        res.status(201).json({ success: true, message: "ซื้อตอนนิยายสำเร็จ!", result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 2. สร้างรายการชำระเงิน (Top Up) - ฉบับปรับปรุงความปลอดภัย
 */

exports.processPaySolutionsCharge = async (req, res) => {
    try {
        const { amount, totalCoins } = req.body; 
        const merchantId = (process.env.PAYSOLUTION_MERCHANT_ID || '53453347').trim();
        const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
        const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "จำนวนเงินไม่ถูกต้อง" });
        }

        // แก้ไข: สร้าง RefNo ให้ยาวขึ้นและไม่ซ้ำกันแน่นอน (ป้องกัน Error: refno already in use)
        // ใช้รหัส BSSB + เวลาปัจจุบัน + เลขสุ่ม 3 หลัก
        const generateRefNo = () => {
            // ใช้ Date.now() จะได้ตัวเลขประมาณ 13 หลัก (เช่น 1712954400000)
            // ตัดเอาเฉพาะ 12 หลักสุดท้ายเพื่อให้เป็นตัวเลขล้วนตาม Spec เป๊ะๆ
            return Date.now().toString().slice(-12);
        };

        const uniqueRefNo = generateRefNo(); // ผลลัพธ์จะเป็น BXXXXXXXXXXX (รวม 12 หลักพอดี)

        await prisma.topUpHistory.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(amount),
                coinsReceived: totalCoins ? parseInt(totalCoins) : Math.floor(amount), 
                status: "PENDING",
                method: "PAYSOLUTION",
                transactionId: uniqueRefNo 
            }
        });

        res.status(200).json({
            success: true,
            paymentData: {
                // แก้ไข: ใช้ URL Endpoint หลักของ v6 ตาม Docs ล่าสุด
                actionUrl: "https://payments.paysolutions.asia/payment", 
                merchantid: merchantId,
                refno: uniqueRefNo,
                customeremail: req.user.email || 'reader@test.com',
                productdetail: `Topup_${totalCoins}_Coins`,
                total: parseFloat(amount).toFixed(2), 
                posturl: `${backendUrl}/api/payments/webhook`,
                returnurl: `${frontendUrl}/payment/success`
            }
        });
    } catch (error) {
        console.error("❌ Payment Charge Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

/**
 * Webhook (Postback) จาก Pay Solutions
 */
exports.paySolutionsWebhook = async (req, res) => {
    // รับค่าจาก PaySolutions (v6 ส่งผ่าน Body)
    const { refno, total, status } = req.body;

    try {
        console.log(`📩 Webhook Received: RefNo=${refno}, Status=${status}, Total=${total}`);

        const transaction = await prisma.topUpHistory.findFirst({
            where: { transactionId: refno },
        });

        if (!transaction) {
            console.error(`❌ RefNo ${refno} ไม่พบในระบบ`);
            return res.status(200).send("NOT_FOUND"); // ส่ง 200 เพื่อบอกว่ารับทราบแล้วแต่ไม่พบข้อมูล
        }

        if (transaction.status === "SUCCESS") {
            return res.status(200).send("ALREADY_DONE");
        }

        // "CP" คือรหัสของ PaySolutions สำหรับการจ่ายเงินสำเร็จ
        if (status === "CP") {
            await prisma.$transaction([
                // 1. อัปเดตสถานะบิล
                prisma.topUpHistory.update({
                    where: { id: transaction.id },
                    data: { status: "SUCCESS" }
                }),
                // 2. เพิ่ม Coins ให้ User
                prisma.user.update({
                    where: { id: transaction.userId },
                    data: { coins: { increment: transaction.coinsReceived } }
                }),
                // 3. แจ้งเตือน
                prisma.notification.create({
                    data: {
                        userId: transaction.userId,
                        title: "เติมเงินสำเร็จ",
                        message: `คุณได้รับ ${transaction.coinsReceived} คอยน์เรียบร้อยแล้ว`,
                        type: "PAYMENT"
                    }
                })
            ]);
            console.log(`✅ Success: User ${transaction.userId} received ${transaction.coinsReceived} coins.`);
        } else {
            // รายการล้มเหลว หรือถูกยกเลิก
            await prisma.topUpHistory.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            });
        }

        // ต้องตอบกลับว่า "OK" หรือ "200" เพื่อให้ PaySolutions ทราบว่าเราได้รับข้อมูลแล้ว
        res.status(200).send("OK");
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send("INTERNAL_SERVER_ERROR");
    }
};

/**
 * 4. ตรวจสอบสถานะการชำระเงิน
 */
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { refno } = req.params; // รับ RefNo หรือ ID
        const transaction = await prisma.topUpHistory.findFirst({
            where: { 
                OR: [
                    { id: refno },
                    { transactionId: refno }
                ]
            }
        });

        if (!transaction) return res.status(404).json({ message: "ไม่พบรายการ" });
        res.json({ status: transaction.status });
    } catch (error) {
        res.status(500).json({ message: "Error checking status" });
    }
};

/**
 * 5. ดึงประวัติการเติมเงิน
 */
exports.getHistory = async (req, res) => {
    try {
        const history = await prisma.topUpHistory.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลประวัติได้" });
    }
};