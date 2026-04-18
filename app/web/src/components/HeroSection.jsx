import React from 'react';
// ✅ สำหรับ Outline icons (เส้นโปร่ง)
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

// ✅ สำหรับ Solid icons (สีทึบ)
import { MegaphoneIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const HeroSection = () => {
  return (
    <section className="relative bg-white overflow-hidden py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 lg:max-w-2xl lg:w-full">
          
          {/* Badge ต้อนรับ */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <SparklesIcon className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">
              Welcome to bussababun.com
            </span>
          </div>

          {/* หัวข้อหลัก */}
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">อาณาจักรนิยายออนไลน์</span>{' '}
            <span className="block text-indigo-600 xl:inline">ที่รวมทุกจินตนาการ</span>
          </h1>
          
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl lg:mx-0">
            พบกับผลงานคุณภาพจากนักเขียนทั่วประเทศ ภายใต้การดูแลของ **บริษัท บงกชกร (bongkochakorn)** ไม่ว่าคุณจะเป็นนักอ่านที่หลงรักในเรื่องราว หรือนักเขียนที่อยากสานฝัน ที่นี่คือพื้นที่ของคุณ
          </p>

          {/* ปุ่มกด (Call to Action) */}
          <div className="mt-8 sm:flex sm:justify-start gap-4">
            <div className="rounded-2xl shadow">
              <a
                href="/novels"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all transform hover:scale-105"
              >
                เริ่มอ่านนิยาย
              </a>
            </div>
            <div className="mt-3 sm:mt-0">
              <a
                href="/become-writer"
                className="w-full flex items-center justify-center px-8 py-3 border border-indigo-600 text-base font-bold rounded-2xl text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-all"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                สมัครเป็นนักเขียน
              </a>
            </div>
          </div>

          {/* สถิติคร่าวๆ (Optional) */}
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-gray-100 pt-8">
            <div>
              <p className="text-2xl font-bold text-gray-900">50K+</p>
              <p className="text-sm text-gray-500">นักอ่านทั้งหมด</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1,200+</p>
              <p className="text-sm text-gray-500">นิยายในระบบ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">800+</p>
              <p className="text-sm text-gray-500">นักเขียนคุณภาพ</p>
            </div>
          </div>
        </div>
      </div>

      {/* พื้นหลังตกแต่ง (Abstract Shapes) */}
      <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center relative">
            {/* คุณสามารถใส่รูปหน้าปกนิยายสวยๆ หรือ Illustration ตรงนี้ได้ */}
            <div className="w-72 h-96 bg-white rounded-3xl shadow-2xl transform rotate-6 border-4 border-white overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1543004629-1420f540ae72?q=80&w=150&auto=format&fit=crop" 
                    alt="Book Cover Preview" 
                    className="w-full h-full object-cover opacity-80"
                />
            </div>
            <div className="absolute w-72 h-96 bg-indigo-600 rounded-3xl shadow-2xl transform -rotate-6 -z-10 translate-x-12 opacity-20"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;