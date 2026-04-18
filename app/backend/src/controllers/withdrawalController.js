const prisma = require('../lib/prisma');
const { Resend } = require('resend');

// ตรวจสอบ API KEY
if (!process.env.RESEND_API_KEY) {
    console.error("❌ Missing RESEND_API_KEY in environment variables");
}
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 1. ส่งรหัส OTP ไปยัง Email
 */
exports.sendWithdrawOTP = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, username: true }
        });

        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        if (!user.email) return res.status(400).json({ message: "บัญชีของคุณยังไม่ได้ระบุอีเมล" });

        // สร้างรหัส OTP 6 หลัก
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60000); // 5 นาที

        await prisma.user.update({
            where: { id: userId },
            data: { 
                withdrawalOTP: otp,
                withdrawalOTPExpiry: expiry
            }
        });

        // ส่ง Email ผ่าน Resend
        const { data, error } = await resend.emails.send({
            from: 'Bussababun Security <support@bussababun.com>', 
            to: [user.email],
            subject: 'รหัส OTP สำหรับยืนยันการถอนเงิน - Bussababun',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                    <h2 style="color: #f97316; text-align: center;">ยืนยันการถอนเงิน</h2>
                    <p>เรียน คุณ ${user.username || 'ผู้ใช้งาน'},</p>
                    <p>รหัส OTP สำหรับแจ้งถอนเงินของคุณคือ:</p>
                    <div style="letter-spacing: 8px; color: #1e293b; text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px; font-size: 32px; font-weight: bold; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #ef4444; font-size: 14px; text-align: center;">*รหัสนี้มีอายุการใช้งาน 5 นาทีเท่านั้น</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #64748b; text-align: center;">หากคุณไม่ได้ทำรายการนี้ โปรดเปลี่ยนรหัสผ่านทันที</p>
                </div>
            `
        });

        if (error) throw new Error(error.message);

        res.json({ success: true, message: "ส่งรหัส OTP เรียบร้อยแล้ว โปรดเช็คอีเมลของคุณ" });
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ success: false, message: "ระบบส่งอีเมลขัดข้อง กรุณาลองใหม่อีกครั้ง" });
    }
};

/**
 * 2. ตรวจสอบ OTP และบันทึกคำขอถอนเงิน
 */
exports.requestWithdraw = async (req, res) => {
    try {
        const { amount, bankAccount, bankName, bankAccountName, otp } = req.body;
        const userId = req.user.id;
        const MIN_WITHDRAW = 100;

        // 1. Validation
        if (!otp) return res.status(400).json({ message: "กรุณาระบุรหัส OTP" });
        if (!bankAccount || !bankName || !bankAccountName) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน" });
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAW) {
            return res.status(400).json({ message: `ยอดถอนขั้นต่ำคือ ${MIN_WITHDRAW} บาท` });
        }

        // 2. Transaction Start
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ 
                where: { id: userId },
                select: { 
                    income: true, 
                    withdrawalOTP: true, 
                    withdrawalOTPExpiry: true 
                }
            });

            // ตรวจสอบ OTP
            if (!user.withdrawalOTP || user.withdrawalOTP !== otp) {
                throw new Error("รหัส OTP ไม่ถูกต้อง");
            }

            if (new Date() > user.withdrawalOTPExpiry) {
                throw new Error("รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่");
            }

            // ตรวจสอบยอดเงิน (Double Check)
            const currentBalance = Number(user.income || 0); 
            if (currentBalance < withdrawAmount) {
                throw new Error("ยอดรายได้คงเหลือไม่เพียงพอ");
            }

            // 3. หักเงิน และ ล้าง OTP
            // การใช้ update พร้อม decrement ใน transaction จะปลอดภัยที่สุด
            await tx.user.update({
                where: { id: userId },
                data: { 
                    income: { decrement: withdrawAmount },
                    withdrawalOTP: null,
                    withdrawalOTPExpiry: null
                }
            });

            // 4. สร้างรายการ Withdrawal
            return await tx.withdrawal.create({
                data: {
                    userId,
                    amount: withdrawAmount,
                    bankAccount,
                    bankName,
                    bankAccountName,
                    status: "PENDING"
                }
            });
        });

        res.json({ 
            success: true, 
            message: "ส่งคำขอถอนเงินสำเร็จ ระบบจะดำเนินการโอนเงินให้ท่านโดยเร็วที่สุด", 
            data: result 
        });

    } catch (error) {
        console.error("Withdraw Request Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 3. ดึงประวัติการถอนเงิน
 */
exports.getMyWithdrawHistory = async (req, res) => {
    try {
        const history = await prisma.withdrawal.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20 // แสดงล่าสุด 20 รายการ
        });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: "ไม่สามารถโหลดข้อมูลประวัติได้" });
    }
};