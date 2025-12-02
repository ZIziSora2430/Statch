import Avatar from '../images/Avatar.png';
import React, { useState } from 'react';

const API_BASE_URL = "http://localhost:8000";

// Nhận thêm prop onPostSuccess để reload lại trang Community
export default function CreatePost({ onClose, onPostSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('district1'); // ĐÃ ĐỔI: Mặc định là Quận 1
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CALL API 3: Tạo bài viết mới ---
  const handlePost = async () => {
    // Validate cơ bản phía Client
    if (title.length < 5) return alert("Tiêu đề phải ít nhất 5 ký tự");
    if (content.length < 10) return alert("Nội dung phải ít nhất 10 ký tự");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token"); 
      
      if (!token) {
        alert("Bạn cần đăng nhập lại để đăng bài!");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // ĐÃ ĐỔI: category -> location
        body: JSON.stringify({
          title: title,
          content: content,
          location: location
        })
      });

      if (response.ok) {
        if (onPostSuccess) onPostSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData. detail || "Không thể đăng bài"}`);
      }

    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. LỚP PHỦ (OVERLAY)
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-black/25 backdrop-blur flex justify-center items-center z-50"
    >
      
      {/* 2. NỘI DUNG MODAL */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
          <div className="flex flex-col">
             <p className="font-semibold text-sm">Tạo bài viết mới</p>
             
             {/* ĐÃ ĐỔI: Chọn Location (Quận/Huyện TP. HCM) */}
             <select 
               className="text-xs bg-gray-100 border-none rounded p-1 mt-1 outline-none cursor-pointer"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
             >
               {/* Quận 1-12 */}
               <optgroup label="Quận">
                 <option value="district1">Quận 1</option>
                 <option value="district2">Quận 2</option>
                 <option value="district3">Quận 3</option>
                 <option value="district4">Quận 4</option>
                 <option value="district5">Quận 5</option>
                 <option value="district6">Quận 6</option>
                 <option value="district7">Quận 7</option>
                 <option value="district8">Quận 8</option>
                 <option value="district9">Quận 9</option>
                 <option value="district10">Quận 10</option>
                 <option value="district11">Quận 11</option>
                 <option value="district12">Quận 12</option>
               </optgroup>
               
               {/* Các quận khác */}
               <optgroup label="Quận khác">
                 <option value="binh_thanh">Quận Bình Thạnh</option>
                 <option value="binh_tan">Quận Bình Tân</option>
                 <option value="phu_nhuan">Quận Phú Nhuận</option>
                 <option value="tan_binh">Quận Tân Bình</option>
                 <option value="tan_phu">Quận Tân Phú</option>
                 <option value="go_vap">Quận Gò Vấp</option>
               </optgroup>
               
               {/* TP Thủ Đức */}
               <optgroup label="Thành phố">
                 <option value="thu_duc">TP Thủ Đức</option>
               </optgroup>
               
               {/* Huyện */}
               <optgroup label="Huyện">
                 <option value="hoc_mon">Huyện Hóc Môn</option>
                 <option value="binh_chanh">Huyện Bình Chánh</option>
                 <option value="nha_be">Huyện Nhà Bè</option>
                 <option value="can_gio">Huyện Cần Giờ</option>
                 <option value="cu_chi">Huyện Củ Chi</option>
               </optgroup>
             </select>
          </div>
        </div>

        {/* Input Tiêu đề */}
        <input 
          type="text"
          className="w-full p-2 mb-2 font-bold text-lg border-b focus:outline-none focus:border-red-500 placeholder-gray-400"
          placeholder="Tiêu đề bài viết (ngắn gọn)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Khung nhập nội dung */}
        <textarea
          className="w-full h-32 p-2 resize-none focus:outline-none text-gray-700"
          placeholder="Hãy chia sẻ chi tiết trải nghiệm của bạn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Các nút */}
        <div className="flex justify-between items-center mt-4 border-t pt-3">
          <button className="text-sm border px-3 py-1 rounded-full hover:bg-gray-100 text-gray-600">
            Thêm ảnh
          </button>
          
          <button 
            onClick={handlePost}
            disabled={!title || !content || isSubmitting}
            className={`font-bold px-6 py-2 rounded-full transition-colors ${
              (title && content) 
                ? 'bg-red-700 text-white hover:bg-red-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ?  "Đang đăng..." : "Đăng"}
          </button>
        </div>

      </div>
    </div>
  );
}