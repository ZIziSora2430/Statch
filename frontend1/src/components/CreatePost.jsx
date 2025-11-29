import Avatar from '../images/Avatar.png';
import React, { useState } from 'react';

const API_BASE_URL = "http://localhost:8000";

// Nhận thêm prop onPostSuccess để reload lại trang Community
export default function CreatePost({ onClose, onPostSuccess }) {
  const [title, setTitle] = useState('');      // Bắt buộc theo schema
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general'); // Mặc định là general
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CALL API 3: Tạo bài viết mới ---
  const handlePost = async () => {
    // Validate cơ bản phía Client
    if (title.length < 5) return alert("Tiêu đề phải ít nhất 5 ký tự");
    if (content.length < 10) return alert("Nội dung phải ít nhất 10 ký tự");

    setIsSubmitting(true);
    try {
      // 1. LẤY TOKEN (Sửa: dùng access_token và bỏ comment)
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
          "Authorization": `Bearer ${token}` // 2. GỬI HEADER (Bỏ comment dòng này)
        },
        // Payload phải khớp với PostCreate trong schemas.py
        body: JSON.stringify({
          title: title,
          content: content,
          category: category
        })
      });

      if (response.ok) {
        // Đăng thành công
        if (onPostSuccess) onPostSuccess(); // Refresh lại list ở trang chủ
        onClose(); // Đóng modal
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.detail || "Không thể đăng bài"}`);
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
             {/* Chọn Category (Bắt buộc theo Schema) */}
             <select 
               className="text-xs bg-gray-100 border-none rounded p-1 mt-1 outline-none cursor-pointer"
               value={category}
               onChange={(e) => setCategory(e.target.value)}
             >
               <option value="general">Tổng hợp</option>
               <option value="tips">Mẹo du lịch</option>
               <option value="questions">Hỏi đáp</option>
               <option value="reviews">Đánh giá</option>
               <option value="stories">Câu chuyện</option>
             </select>
          </div>
        </div>

        {/* Input Tiêu đề (Schema yêu cầu min 5 ký tự) */}
        <input 
          type="text"
          className="w-full p-2 mb-2 font-bold text-lg border-b focus:outline-none focus:border-red-500 placeholder-gray-400"
          placeholder="Tiêu đề bài viết (ngắn gọn)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Khung nhập nội dung (Schema yêu cầu min 10 ký tự) */}
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
            {isSubmitting ? "Đang đăng..." : "Đăng"}
          </button>
        </div>

      </div>
    </div>
  );
}