// CommunityPage.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Search, Pencil } from "lucide-react";
import CityButton from "../components/CityButton";
import SearchButton from "../components/SearchButton.jsx";
import PostCard from "../components/Postcard";
import Avatar from '../images/Avatar.png';
import CreatePost from "../components/CreatePost.jsx";
import { Link } from "react-router-dom";
import { MOCK_POSTS } from './data.jsx';

function CommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS); 
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // GIẢ LẬP TRẠNG THÁI VERIFY
  const isVerified = true;   // đổi thành true để test giao diện verify

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* Sidebar trái */}
        <aside className="w-1/5 px-4 pb-4 pt-18 flex flex-col gap-4 top-1 h-fit">
          <CityButton />
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
              Bạn chỉ có thể đăng bài hoặc bình luận khi đã đặt phòng
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
            {posts
              .filter((p) => p.content.toLowerCase().includes(search.toLowerCase()))
              .map((post) => (
                <Link 
                  to={`/post/${post.id}`} 
                  key={post.id} 
                  className="no-underline text-black"
                >
                  <PostCard post={post} />
                </Link>
              ))}
          </div>

        </main>
      </div>

      {/* Modal tạo bài viết */}
      {isVerified && isModalOpen && (
        <CreatePost onClose={() => setIsModalOpen(false)} />
      )}

    </div>
  );
}

export default CommunityPage;
