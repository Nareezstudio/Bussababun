require('dotenv').config();
const app = require('./src/app'); // CORS ถูกตั้งค่าไว้ในนี้แล้วตั้งแต่ตอน require

const PORT = process.env.PORT || 8080;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing!");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // ถ้ามีค่า FRONTEND_URL ใน Railway Variables ให้โชว์ออกมาเช็ค
  console.log(`📡 Production URL: ${process.env.FRONTEND_URL || 'Using hardcoded origins'}`);
});