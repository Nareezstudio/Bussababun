import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Swal from 'sweetalert2';

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    penName: user?.penName || '',
    profileImage: user?.profileImage || ''
  });

  // ฟังก์ชันอัปโหลดรูป (เรียกใช้ API Cloudinary โดยตรง)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // แสดงตัวอย่างรูปทันที
    setPreview(URL.createObjectURL(file));

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "your_preset"); // ⚠️ เปลี่ยนเป็นของคุณ

    try {
      setLoading(true);
      const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud/image/upload", {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      setFormData({ ...formData, profileImage: fileData.secure_url });
      setLoading(false);
    } catch (err) {
      Swal.fire("Error", "อัปโหลดรูปไม่สำเร็จ", "error");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/user/profile', formData);
      setUser(res.data.user); // อัปเดตข้อมูลใน Context
      Swal.fire("สำเร็จ", "อัปเดตโปรไฟล์เรียบร้อย", "success");
    } catch (err) {
      Swal.fire("ผิดพลาด", err.response?.data?.message || "บันทึกไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-xl font-bold mb-6">แก้ไขโปรไฟล์</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ส่วนรูปภาพ */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img src={preview} className="w-24 h-24 rounded-full object-cover border" />
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">คลิกที่รูปเพื่อเปลี่ยน</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ชื่อผู้ใช้</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">นามปากกา</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.penName}
            onChange={(e) => setFormData({...formData, penName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.realName}
            onChange={(e) => setFormData({...formData, realName: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
        >
          {loading ? "กำลังอัปโหลด..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;