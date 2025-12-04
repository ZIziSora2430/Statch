import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchingBar from "../components/SearchingBar";
import ImageFrame from "../components/ImageFrame";
import Promo from "../components/PromotionCarousel";
import Banner from "../components/Banner";
import SkeletonCard from "../components/SkeletonCard";
import Community from "../components/JoinCommunity";

import GV from "../images/Gò Vấp.jpg";
import Q1 from "../images/quận 1.png";  
import Q7 from "../images/quận 7.jpg";
import TĐ from "../images/Thủ Đức.jpg";
import Q5 from "../images/quận 5.jpg";

import { useNavigate } from "react-router-dom"; 
import React, { useState, useEffect } from "react"; 
import { MapPin, Star, Sparkles, ArrowRight } from "lucide-react";

const API_URL = import.meta.env. VITE_API_URL || "http://127.0.0.1:8000";


export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);



  const [currentUserName, setCurrentUserName] = useState("bạn");
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState("");
  const navigate = useNavigate(); 

  const handleDestinationClick = (location) => {
    setSelectedDestination(location);
    // Cuộn mượt lên đầu trang (nơi có thanh tìm kiếm)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username"); 
    // 3.  KIỂM TRA ĐĂNG NHẬP
    if (! token) {
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
            "Authorization": `Bearer ${token}`
          }
        });

        // 4.  Xử lý lỗi HTTP (Fetch không tự catch lỗi 4xx/5xx như Axios)
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
        console. error("Lỗi khi fetch dữ liệu:", error);
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

  // --- COMPONENT PHỤ ---
  const DestinationCard = ({ img, title, className, onClick }) => (
    <div 
      className={`relative group rounded-2xl overflow-hidden shadow-md cursor-pointer ${className}`}
      style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
      onClick={onClick}
    >
      {/* 3. DÙNG THẺ IMG TRỰC TIẾP (Thay cho ImageFrame) */}
      <img 
        src={img}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* 5.  Nội dung chữ */}
      <div className="absolute bottom-4 left-4 text-white drop-shadow-lg z-10">
        <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
        <span className="text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 mt-1">
          Khám phá ngay <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );

  // --- VIEW: LOADING STATE ---
// Replace your loading state section with this:

if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 w-full"> 
        <Navbar />
      </div>
      <Banner username={currentUserName} />

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10 -mt-10 md:-mt-16">
        {/* ADD THE SAME ANIMATION WRAPPER HERE */}
      <div className={`max-w-5xl mx-auto mb-12 transition-all duration-300 ease-in-out relative z-50
        ${mounted && scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-3 md:p-3 border border-gray-100">
          <SearchingBar initialLocation={selectedDestination} />
        </div>
      </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              Đang tìm gợi ý tốt nhất cho bạn... 
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </main>
    </div>
  );
}

  // --- VIEW: MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-100 w-full bg-white shadow-sm"> 
        <Navbar />
      </div>
      <Banner username={currentUserName}/>

      {/* Wrapper chính có margin âm để đẩy content đè lên banner 1 chút tạo chiều sâu */}
      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative -mt-10 md:-mt-16">
        
      <div className={`max-w-5xl mx-auto mb-12 transition-all duration-300 ease-in-out relative z-50
        ${mounted && scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-2 md:p-4 border border-gray-100">
          <SearchingBar initialLocation={selectedDestination} />
        </div>
      </div>

        {/* --- PHẦN 1: GỢI Ý CHỖ Ở (AI RECOMMENDATIONS) --- */}
        <section className="max-w-7xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-yellow-500 w-8 h-8" /> {/* Icon trang trí */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Gợi ý dành riêng cho bạn
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accommodations.length > 0 ? (
              accommodations. map((item) => (
                <div 
                  key={item.id || item.accommodation_id} 
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() => navigate(`/accommodations/${item.accommodation_id || item.id}`)}
                >
                  {/* BADGE ĐIỂM SỐ AI */}
                  {item.match_score && (
                    <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1. 5 rounded-full shadow-sm border border-green-100 flex items-center gap-1. 5">
                      <span className="text-green-600 font-extrabold text-sm">{item.match_score}%</span>
                      <span className="text-gray-600 text-xs font-medium">phù hợp</span>
                    </div>
                  )}

                  {/* Ảnh với hiệu ứng zoom khi hover */}
                  <div className="h-56 w-full bg-gray-200 overflow-hidden relative">
                    <img 
                      src={item.picture_url ? item.picture_url.split(',')[0] : "https://via.placeholder.com/400"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Nội dung Card */}
                  <div className="p-5 flex flex-col grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                      <MapPin size={14} /> {item.location}
                    </p>
                    
                    {/* AI REASON BOX */}
                    {item.match_reason && (
                      <div className="mb-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-indigo-800 italic leading-relaxed">
                            "{item.match_reason}"
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400">Giá mỗi đêm</p>
                        <span className="text-blue-600 font-bold text-xl">
                          {formatCurrency(item. price)}
                        </span>
                      </div>
                      <button className="text-sm font-medium bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-lg transition-all duration-200">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-gray-400 w-10 h-10" />
                </div>
                <p className="text-gray-500 text-lg">Không tìm thấy chỗ ở nào phù hợp. </p>
              </div>
            )}
          </div>
        </section>

        {/* --- PHẦN 2: ĐIỂM ĐẾN THỊNH HÀNH (TRENDING) --- */}
        <section className="max-w-7xl mx-auto mb-16">
          <h2 className="mb-8 text-3xl md:text-4xl font-bold text-gray-900 text-left">
            Điểm đến thịnh hành
          </h2>

          {/* Grid Layout thay thế cho Flexbox cứng nhắc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             {/* Hàng trên: 2 ảnh lớn */}
             <DestinationCard 
             img={GV} 
             title="Gò Vấp" 
             className="h-64 md:h-80" 
             onClick={() => handleDestinationClick("Gò Vấp")}
             />
             <DestinationCard 
             img={Q1} 
             title="Quận 1" 
             className="h-64 md:h-80" 
             onClick={() => handleDestinationClick("quận 1")}
             />
          </div>      
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {/* Hàng dưới: 3 ảnh nhỏ */}
             <DestinationCard 
             img={Q5} s
             title="Quận 5" 
             className="h-56 md:h-64"
             onClick={() => handleDestinationClick("quận 5")}
             />
             <DestinationCard 
             img={TĐ} 
             title="Thủ Đức" 
             className="h-56 md:h-64"
             onClick={() => handleDestinationClick("Thủ Đức")}
             />
             <DestinationCard 
             img={Q7} 
             title="Quận 7" 
             className="h-56 md:h-64"
             onClick={() => handleDestinationClick("quận 7")} 
             />
          </div>
        </section>

        {/* --- PHẦN 3: ƯU ĐÃI (PROMO) --- */}
        <section className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100">
            <Promo />
          </div>
        </section>
        <Community />
      </main>

      
      <Footer/>
    </div>
  );
}