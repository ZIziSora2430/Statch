// CommunityPage.jsx
import React, { useState, useEffect } from "react"; // [Cite: React Hooks]
import Navbar from "../components/Navbar";
import { Search, Pencil } from "lucide-react";
import CityButton from "../components/CityButton";
import SearchButton from "../components/SearchButton.jsx";
import PostCard from "../components/Postcard";
import Avatar from '../images/Avatar.png';
import CreatePost from "../components/CreatePost.jsx";
import { Link } from "react-router-dom";
import SelectDistrict from "../components/SelectDistrict.jsx";

// Cấu hình URL API (Chỉnh lại port nếu cần)
const API_BASE_URL = "http://localhost:8000"; 

function CommunityPage() {
  const [posts, setPosts] = useState([]); 
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");


  // State cho trạng thái verify
  const [isVerified, setIsVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

// --- CALL API 1: Lấy trạng thái Verified Traveler ---
const fetchVerifiedStatus = async () => {
  try {
    // 1. Lấy token thật từ localStorage (kiểm tra tên key của bạn là 'access_token' hay 'token')
    const token = localStorage.getItem("access_token"); 
    
    // Nếu không có token (chưa đăng nhập) thì thôi không gọi API này nữa
    if (!token) return; 

    const response = await fetch(`${API_BASE_URL}/verified-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // <--- QUAN TRỌNG: Gửi token lên
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setIsVerified(data.is_verified);
      setVerifyMessage(data.message);
    }
  } catch (error) {
    console.error("Lỗi khi check verify:", error);
  }
};

  // --- CALL API 2: Lấy danh sách bài viết ---
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts?skip=0&limit=50`, {
        method: "GET"
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data); // Cập nhật danh sách bài viết từ Backend
      }
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component được load (mount)
  useEffect(() => {
    fetchVerifiedStatus();
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* Sidebar trái */}
        <aside className="w-1/5 px-4 pb-4 pt-18 flex flex-col gap-4 top-1 h-fit">
          <CityButton onClick={() => setIsCityModalOpen(true)} />
          <SearchButton value={search} onChange={setSearch} />
        </aside>

        {/* NÚT FLOATING - CHỈ HIỆN KHI ĐÃ VERIFY */}
        {isVerified && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-15 left-15 w-14 h-14 rounded-full bg-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-400 transition cursor-pointer"
          >
            <Pencil size={24} />
          </button>
        )}

        {/* Nội dung chính */}
        <main className="flex-1 px-6 pt-18 pb-6">

          {/* 🟥 BANNER cảnh báo khi chưa verify */}
          {!isVerified && (
            <div className="w-full bg-red-700 text-white text-center py-3 rounded-xl font-medium mb-6 shadow-md">
              {verifyMessage || "Bạn chỉ có thể đăng bài hoặc bình luận khi đã đặt phòng"}
            </div>
          )}

          {/* Ô “Bạn đang nghĩ gì” – CHỈ HIỆN KHI ĐÃ VERIFY */}
          {isVerified && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 mb-6 bg-red-700 rounded-2xl p-3 shadow-md cursor-pointer"
            >
              <img src={Avatar} alt="avatar" className="w-12 h-12 rounded-full" />

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Bạn đang nghĩ gì"
                  className="w-full rounded-full bg-white text-gray-800 px-5 py-3 pr-10 shadow-sm focus:outline-none placeholder-gray-500 pointer-events-none"
                  readOnly
                />
                <Pencil className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>
          )}

          {/* Danh sách bài viết */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Đang tải bài viết...</p>
            ) : (
              posts
                .filter((p) => 
                  (!selectedDistrict || p.district === selectedDistrict) &&
                  (p.content?.toLowerCase().includes(search.toLowerCase()) ||
                  p.title?.toLowerCase().includes(search.toLowerCase()))
                )
                .map((post) => (
                  <Link 
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="no-underline text-black"
                  >
                    <PostCard post={post} />
                  </Link>
                ))
            )}
          </div>

        </main>
      </div>
      {/* Modal chọn quận */}
      {isCityModalOpen && (
        <SelectDistrict
          onClose={() => setIsCityModalOpen(false)}
          onSelect={(district) => {
          setSelectedDistrict(district);
          setIsCityModalOpen(false);
          }}
         />
      )}

      {/* Modal tạo bài viết */}
      {/* Truyền thêm hàm fetchPosts để refresh lại list sau khi đăng bài thành công */}
      {isVerified && isModalOpen && (
        <CreatePost 
          onClose={() => setIsModalOpen(false)} 
          onPostSuccess={fetchPosts} 
        />
      )}

    </div>
  );
}

export default CommunityPage;