import Avatar from '../images/Avatar.png';
import React, { useState } from 'react';


// Component này nhận prop 'onClose' từ cha
export default function CreatePost({ onClose }) {
  const [postText, setPostText] = useState('');
  return (
    // 1. LỚP PHỦ (OVERLAY)
    // Nó bao phủ toàn màn hình, làm mờ nền và nằm trên cùng (z-50)
    <div 
      onClick={onClose} // Bấm ra ngoài nền mờ sẽ đóng modal
      className="fixed inset-0 bg-black/25 backdrop-blur flex justify-center items-center z-50"
      >
      
      {/* 2. NỘI DUNG MODAL (HỘP TRẮNG) */}
      {/* Thêm onClick e.stopPropagation() để khi bấm vào hộp trắng, nó không bị đóng */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md mx-4"
      >
        {/* Header (giống trong hình) */}
        <div className="flex items-center gap-3 mb-4">
          <img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
          <p className="font-semibold">Bạn đang nghĩ gì</p>
        </div>

        {/* Khung nhập liệu */}
        <textarea
          className="w-full h-32 p-2 border rounded-md focus:outline-none"
          placeholder="Hãy chia sẻ trải nghiệm của bạn..."
          value ={postText}
          onChange={(e) => setPostText(e.target.value)}
          autoFocus // Tự động focus vào đây khi modal mở
        />

        {/* Các nút (giống trong hình) */}
        <div className="flex justify-between items-center mt-4">
          <button className="text-sm border px-3 py-1 rounded-full hover:bg-gray-100">
            Chọn địa điểm
          </button>
          <button 
            onClick={onClose} // Nút "Đăng" tạm thời cũng sẽ đóng modal
            className={`bg-gray-300 font-bold px-6 py-2 rounded-full ${
              postText ? 'text-black' : 'text-gray-400'
            }`}

            // Bạn có thể đổi thành bg-red-700 khi người dùng đã nhập chữ
          >
            Đăng
          </button>
        </div>

      </div>
    </div>
  );
}