import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';

const ContestList = () => {
  const [contests, setContests] = useState([]);

  // สมมติการดึงข้อมูลจาก API
  useEffect(() => {
    // fetchContests();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contest Zone</h1>
        <p className="text-gray-600">สนามประลองนักเขียนหน้าใหม่ ชิงรางวัลและเกียรติยศ</p>
      </div>

      {/* Contest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card ตัวอย่าง */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 bg-purple-600 relative">
             <img src="/api/placeholder/400/200" alt="Banner" className="w-full h-full object-cover opacity-80" />
             <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
               กำลังเปิดรับผลงาน
             </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ประกวดนิยายรักโรแมนติก 2026</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              ร่วมถ่ายทอดเรื่องราวความรักสุดประทับใจ ไม่จำกัดรูปแบบ...
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span>รางวัลรวม 20,000 บาท</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>หมดเขต 30 เมษายน 2569</span>
              </div>
            </div>

            <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center group">
              ดูรายละเอียดและส่งผลงาน
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        {/* เพิ่ม Card อื่นๆ ที่นี่ */}
      </div>
    </div>
  );
};

export default ContestList;