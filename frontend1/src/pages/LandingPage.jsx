import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ImageFrame from "../components/ImageFrame";
import Promo from "../components/PromotionCarousel";
import Banner from "../components/Banner";
import SkeletonCard from "../components/SkeletonCard";

import ConDao from "../images/Con-Dao.jpg";
import HaNoi from "../images/Ha-Noi.jpg";  
import CanTho from "../images/Can-Tho.jpg";
import HoiAn from "../images/Hoi-An.jpg";
import TPHCM from "../images/TPHCM.jpg";

import { useNavigate } from "react-router-dom"; 
import React, { useState, useEffect } from "react"; 

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function LandingPage() {
  const [currentUserName, setCurrentUserName] = useState("bạn");
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); // Hook để chuyển trang

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username"); 
    // 3. KIỂM TRA ĐĂNG NHẬP
    // Nếu không có token -> Đá về trang login ngay
    if (!token) {
      alert("Bạn cần đăng nhập để sử dụng tính năng này!");
      navigate("/login"); 
      return; // Dừng chạy tiếp
    }

    if (storedUsername) {
      setCurrentUserName(storedUsername);
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accommodations/recommendations/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // QUAN TRỌNG: Gửi token dạng "Bearer <token>"
            "Authorization": `Bearer ${token}`
          }
        });

        // 4. Xử lý lỗi HTTP (Fetch không tự catch lỗi 4xx/5xx như Axios)
        if (!response.ok) {
          // Nếu lỗi 401 (Unauthorized) -> Token hết hạn hoặc sai
          if (response.status === 401) {
            alert("Phiên đăng nhập hết hạn.");
            localStorage.removeItem("access_token"); // Xóa token rác
            navigate("/login"); // Đá về login
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 5. Parse JSON
        const data = await response.json();
        setAccommodations(data);

      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Hàm format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Nếu đang check login hoặc đang load thì hiện màn hình chờ
  if (isLoading) {
      return (
      <div>
        <Navbar />
        {/* Giữ nguyên Banner để layout không bị giật */}
        <Banner username={currentUserName} />

        <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-16">
          
          {/* Vẫn hiện thanh tìm kiếm */}
          <div className="md:mb-8 lg:mb-10">
            <SearchingBar />
          </div>

          <p className="mb-6 text-black text-4xl font-bold text-left">
            Đang tìm gợi ý tốt nhất cho bạn...
          </p>
          
          {/* --- HIỂN THỊ 3 CÁI SKELETON --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  

  return (
    <div>
      <Navbar />
      <Banner username={currentUserName}/>

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-16">
        
        <div className="md:mb-8 lg:mb-10">
          <SearchingBar />
        </div>

        {/* --- PHẦN DANH SÁCH TỪ DATABASE --- */}
          <p className="mb-6 text-black text-4xl font-bold text-left">
            Gợi ý chỗ ở dành cho bạn
          </p>
          
          {/* Grid hiển thị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {accommodations.length > 0 ? (
              accommodations.map((item) => (
                <div 
                  key={item.id || item.accommodation_id} 
                  className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => navigate(`/accommodations/${item.accommodation_id || item.id}`)}
                >
                  {/*  HIỂN THỊ ĐIỂM SỐ AI (BADGE) */}
                  {item.match_score && (
                      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow border border-green-200 flex items-center gap-1">
                          <span className="text-green-600 font-bold text-sm">{item.match_score}% phù hợp</span>
                          {/* Tooltip hoặc Icon AI */}
                          <span>✨</span>
                      </div>
                  )}

                   {/* Ảnh */}
                  <div className="h-48 w-full bg-gray-200">
                    <img 
                      src={item.picture_url || "https://via.placeholder.com/400"} 
                      alt={item.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {/* Thông tin */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    {/* 🔥 HIỂN THỊ LÝ DO TẠI SAO HỢP */}
                    {item.match_reason && (
                        <div className="mt-2 mb-2 bg-purple-50 p-2 rounded-md border border-purple-100">
                            <p className="text-xs text-purple-700 italic">
                              "{item.match_reason}"
                            </p>
                        </div>
                    )}
                    <p className="text-gray-500 text-sm mb-2 truncate">📍 {item.location}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-bold text-lg">
                           {formatCurrency(item.price)}
                        </span>
                        <button className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
                           Chi tiết
                        </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">Không tìm thấy chỗ ở nào.</p>
            )}
          </div>
        

        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-4">
          <p className="mb-6 ml-13 text-black text-4xl font-bold text-left">
            Điểm đến thịnh hành
          </p>

          {/* HÀNG TRÊN: 2 ảnh to */}
          <div className="flex justify-center gap-3">

            {/* Côn Đảo */}
            <div className="relative w-[45%]">
              <ImageFrame
                src={ConDao}
                alt="Côn Đảo"
                ratio="21/9"
                rounded="xl"
                shadow="lg"
                className="w-full"
              />
              <div className="absolute top-2 left-4 text-white text-xl font-semibold drop-shadow-md">
                Côn Đảo
              </div>
            </div>

            {/* Hà Nội */}
            <div className="relative w-[45%]">
              <ImageFrame
                src={HaNoi}
                alt="Hà Nội"
                ratio="21/9"
                rounded="xl"
                shadow="lg"
                className="w-full"
              />
              <div className="absolute top-2 left-4 text-white text-xl font-semibold drop-shadow-md">
                Hà Nội
              </div>
            </div>
          </div>

          {/* HÀNG DƯỚI: 3 ảnh nhỏ hơn */}
          <div className="flex flex-nowrap justify-center gap-1.5 w-full">

            {/* TP HCM */}
            <div className="relative w-full sm:w-[30%]">
              <ImageFrame
                src={TPHCM}
                alt="TP. Hồ Chí Minh"
                ratio="21/9"
                rounded="xl"
                shadow="md"
                className="w-full"
              />
              <div className="absolute top-2 left-3 text-white text-sm sm:text-base font-semibold drop-shadow-md">
                TP. Hồ Chí Minh
              </div>
            </div>

            {/* Hội An */}
            <div className="relative w-full sm:w-[30%]">
              <ImageFrame
                src={HoiAn}
                alt="Hội An"
                ratio="21/9"
                rounded="xl"
                shadow="md"
                className="w-full"
              />
              <div className="absolute top-2 left-3 text-white text-sm sm:text-base font-semibold drop-shadow-md">
                Hội An
              </div>
            </div>

            {/* Cần Thơ */}
            <div className="relative w-full sm:w-[30%]">
              <ImageFrame
                src={CanTho}
                alt="Cần Thơ"
                ratio="21/9"
                rounded="xl"
                shadow="md"
                className="w-full"
              />
              <div className="absolute top-2 left-3 text-white text-sm sm:text-base font-semibold drop-shadow-md">
                Cần Thơ
              </div>
            </div>
          </div>

          <p className="mt-9 text-black text-4xl font-bold text-center">
            Ưu đãi hôm nay
          </p>

          <div>
            <Promo />
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6 mt-10 text-center">
        <div className="container mx-auto">
          <p className="text-sm">© 2025 Statch. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" className="hover:text-white transition">Về chúng tôi</a>
            <a href="#" className="hover:text-white transition">Liên hệ</a>
            <a href="#" className="hover:text-white transition">Điều khoản</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
