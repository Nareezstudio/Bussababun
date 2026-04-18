// web/src/utils/uploadImage.js
import axios from 'axios';

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset_name'); // ตั้งค่าใน Cloudinary Dashboard
  formData.append('cloud_name', 'your_cloud_name');

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
      formData
    );
    return res.data.secure_url; // ส่ง URL รูปกลับไป
  } catch (error) {
    console.error("Upload Error", error);
    return null;
  }
};