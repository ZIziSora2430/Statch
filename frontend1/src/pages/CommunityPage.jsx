// CommunityPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Search, Pencil } from "lucide-react";
import CityButton from "../components/CityButton";
import SearchButton from "../components/SearchButton.jsx";
import PostCard from "../components/Postcard";
import DefaultAvatar from "../images/avatar-default.svg";
import CreatePost from "../components/CreatePost.jsx";
import { Link } from "react-router-dom";
import SelectDistrict from "../components/SelectDistrict.jsx";

// Cấu hình URL API
const API_BASE_URL = "http://localhost:8000"; 

// Map value -> label để hiển thị trên CityButton
const LOCATION_LABELS = {
  "": "Chọn địa điểm",
  district1: "Quận 1",
  district2: "Quận 2",
  district3: "Quận 3",
  district4: "Quận 4",
  district5: "Quận 5",
  district6: "Quận 6",
  district7: "Quận 7",
  district8: "Quận 8",
  district9: "Quận 9",
  district10: "Quận 10",
  district11: "Quận 11",
  district12: "Quận 12",
  binh_thanh: "Quận Bình Thạnh",
  binh_tan: "Quận Bình Tân",
  phu_nhuan: "Quận Phú Nhuận",
  tan_binh: "Quận Tân Bình",
  tan_phu: "Quận Tân Phú",
  go_vap: "Quận Gò Vấp",
  thu_duc: "TP Thủ Đức",
  hoc_mon: "Huyện Hóc Môn",
  binh_chanh: "Huyện Bình Chánh",
  nha_be: "Huyện Nhà Bè",
  can_gio: "Huyện Cần Giờ",
  cu_chi: "Huyện Củ Chi",
};

function CommunityPage() {
  const [posts, setPosts] = useState([]); 
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(""); // ĐÃ ĐỔI TÊN

  // State cho trạng thái verify
  const [isVerified, setIsVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  // --- CALL API 1: Lấy trạng thái Verified Traveler ---
  const fetchVerifiedStatus = async () => {
    try {
      const token = localStorage.getItem("access_token"); 
      if (!token) return; 

      const response = await fetch(`${API_BASE_URL}/verified-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.is_verified);
        setVerifyMessage(data.message);
      }
    } catch (error) {
      console. error("Lỗi khi check verify:", error);
    }
  };

  // --- CALL API 2: Lấy danh sách bài viết (CÓ FILTER LOCATION) ---
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // ĐÃ SỬA: Thêm param location nếu có
      let url = `${API_BASE_URL}/posts?skip=0&limit=50`;
      if (selectedLocation) {
        url += `&location=${selectedLocation}`;
      }

      const response = await fetch(url, { method: "GET" });

      if (response. ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console. error("Lỗi khi lấy bài viết:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component được load
  useEffect(() => {
    fetchVerifiedStatus();
  }, []);

  // ĐÃ THÊM: Gọi lại API khi đổi location
  useEffect(() => {
    fetchPosts();
  }, [selectedLocation]);

  // Lọc theo search (client-side)
  const filteredPosts = posts.filter((p) =>
    p.content?. toLowerCase().includes(search.toLowerCase()) ||
    p. title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* Sidebar trái */}
        <aside className="w-1/5 px-4 pb-4 pt-18 flex flex-col gap-4 top-1 h-fit">
          {/* ĐÃ SỬA: Truyền label để hiển thị */}
          <CityButton 
            onClick={() => setIsCityModalOpen(true)} 
            label={LOCATION_LABELS[selectedLocation] || "Chọn địa điểm"}
          />
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

          {/* BANNER cảnh báo khi chưa verify */}
          {! isVerified && (
            <div className="w-full bg-red-700 text-white text-center py-3 rounded-xl font-medium mb-6 shadow-md">
              {verifyMessage || "Bạn chỉ có thể đăng bài hoặc bình luận khi đã đặt phòng"}
            </div>
          )}

          {/* Ô "Bạn đang nghĩ gì" – CHỈ HIỆN KHI ĐÃ VERIFY */}
          {isVerified && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 mb-6 bg-red-700 rounded-2xl p-3 shadow-md cursor-pointer"
            >
              <img src={DefaultAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-300 p-0.5"/>

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
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Link 
                  to={`/post/${post.id}`}
                  key={post.id}
                  className="no-underline text-black"
                >
                  <PostCard post={post} />
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                Không có bài viết nào {selectedLocation && `tại ${LOCATION_LABELS[selectedLocation]}`}
              </p>
            )}
          </div>

        </main>
      </div>

      {/* Modal chọn quận */}
      {isCityModalOpen && (
        <SelectDistrict
          selectedValue={selectedLocation}
          onClose={() => setIsCityModalOpen(false)}
          onSelect={(value) => {
            setSelectedLocation(value);
            setIsCityModalOpen(false);
          }}
        />
      )}

      {/* Modal tạo bài viết */}
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