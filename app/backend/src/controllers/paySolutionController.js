const axios = require('axios');
const crypto = require('crypto-js');

exports.createPayment = async (req, res) => {
  try {
    const { amount, productDetail, customerEmail } = req.body;
    
    // 1. สร้าง Order ใน Database ของคุณก่อน (สถานะ PENDING)
    const transaction = await prisma.topUpHistory.create({
      data: {
        userId: req.user.id,
        amount: amount,
        status: "PENDING"
      }
    });

    // 2. เตรียมข้อมูลส่งให้ PaySolution
    const payload = {
      merchantid: process.env.PAYSOLUTION_MERCHANT_ID,
      refno: transaction.id, // ใช้ ID ของ transaction เป็นเลขอ้างอิง
      customeremail: customerEmail,
      productdetail: productDetail,
      total: amount,
      // ... ตั้งค่าอื่นๆ ตามที่ PaySolution กำหนด
    };

    // 3. เรียก API ของ PaySolution เพื่อสร้าง Payment (หรือสร้าง URL ให้ User ไปจ่าย)
    // หมายเหตุ: PaySolution มีหลาย API (API 8.0 หรือ 9.0) ต้องเช็คคู่มือล่าสุดของเขาอีกที
    
    res.status(200).json({ 
      message: "สร้างรายการชำระเงินสำเร็จ",
      refNo: transaction.id,
      // ส่ง URL ไปให้หน้าบ้านเปิดหน้าจ่ายเงิน
      paymentUrl: `https://www.thaiepay.com/epaylink/payment.aspx?merchantid=${payload.merchantid}&refno=${payload.refno}&total=${payload.total}`
    });
  } catch (error) {
    console.error("PaySolution Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อชำระเงิน" });
  }
};


// ฟังก์ชันสำหรับรับข้อมูลจาก PaySolution เมื่อจ่ายเงินสำเร็จ
exports.handlePostback = async (req, res) => {
  // PaySolution อาจส่งมาเป็น query หรือ body ขึ้นอยู่กับการตั้งค่า 
  // แนะนำให้เช็คทั้งคู่
  const data = req.body.refno ? req.body : req.query;
  const { refno, status, total } = data;

  try {
    console.log(`📩 ได้รับ Postback จาก PaySolution: RefNo=${refno}, Status=${status}`);

    if (status === "CP") { // CP = Success
      const transaction = await prisma.topUpHistory.findUnique({
        where: { id: refno }
      });

      if (transaction && transaction.status === "PENDING") {
        await prisma.$transaction([
          prisma.topUpHistory.update({
            where: { id: refno },
            data: { status: "COMPLETED" }
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: { coins: { increment: Math.floor(Number(total)) } }
          })
        ]);
        console.log(`✅ เติมเหรียญสำเร็จให้ Transaction: ${refno}`);
      }
    }
    
    // สำคัญ: PaySolution ต้องการคำตอบรับว่าเราได้รับข้อมูลแล้ว
    res.status(200).send("OK"); 
  } catch (error) {
    console.error("❌ Postback Error:", error);
    res.status(500).send("Internal Server Error");
  }
};