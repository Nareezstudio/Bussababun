import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // ใช้ตัวแปรชื่อ axios ตามที่คุณ import
import { MegaphoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const AdminAnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', target: 'ALL' });
  const [loading, setLoading] = useState(false);

  // 1. ดึงข้อมูลประกาศ (ลบ VITE_API_URL ออกเพื่อให้ใช้ baseURL จากไฟล์ axios.js)
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/admin/announcements'); 
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  // 2. ส่งข้อมูลประกาศใหม่
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // ✅ ส่งเฉพาะข้อมูลที่ Backend ต้องการจริงๆ
        const cleanData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        target: formData.target
        };

        const response = await axios.post('/admin/announcements', cleanData);

        if (response.data.success) {
        alert('ลงประกาศสำเร็จ!');
        setFormData({ title: '', content: '', target: 'ALL' });
        fetchAnnouncements();
        }
    } catch (err) {
        // แสดง Error ที่ส่งกลับมาจาก Server จริงๆ
        console.error("Server Error:", err.response?.data?.message);
        alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || "Internal Server Error"}`);
    } finally {
        setLoading(false);
    }
    };

  // 3. ลบประกาศ
  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบ?")) return;
    try {
      // บังคับแปลงเป็น Number ก่อนส่ง
      await api.delete(`/admin/announcements/${Number(id)}`);
      // ✅ อัปเดต State ทันที: กรองเอาตัวที่ id ตรงกับที่ลบออกไป
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      alert("ลบสำเร็จ!");
      // อย่าลืมอัปเดต state ของรายการประกาศเพื่อให้แถวที่ลบหายไปจากหน้าจอ
    } catch (err) {
      console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MegaphoneIcon className="w-8 h-8 text-indigo-600" />
          ประกาศจากทีมงาน bussababun.com
        </h1>
        <p className="text-sm text-gray-500 mb-4 font-bold italic">
          Operator: bongkochakorn system
        </p>

        {/* --- ฟอร์มสร้างประกาศ --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อประกาศ</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="เช่น ปิดปรับปรุงระบบชั่วคราว..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหาข่าวสาร</label>
              <textarea
                required
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="รายละเอียดข่าวสารที่ต้องการแจ้ง..."
              ></textarea>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มเป้าหมาย</label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                >
                  <option value="ALL">ทุกคน (All)</option>
                  <option value="WRITER">เฉพาะนักเขียน (Writers)</option>
                  <option value="READER">เฉพาะนักอ่าน (Readers)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? 'กำลังส่ง...' : 'ลงประกาศ'}
              </button>
            </div>
          </form>
        </div>

        {/* --- รายการประกาศ --- */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-400 text-xs uppercase tracking-[0.2em]">Latest Logs</h2>
          {announcements.length === 0 ? (
             <div className="text-center py-10 text-gray-400 italic">ไม่มีประกาศในขณะนี้</div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start animate-fadeIn">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.target === 'ALL' ? 'bg-blue-100 text-blue-600' : 
                      item.target === 'WRITER' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {item.target}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : 'เพิ่งลงประกาศ'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementManager;