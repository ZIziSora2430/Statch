// src/pages/RoomDetailPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Footer from "../components/Footer";
import { 
  MapPin, Star, Share, Heart, Wifi, Car, Coffee, Grid,
  Wind, CheckCircle, User, ArrowRight, ChevronDown, X, ChevronLeft, ChevronRight 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function RoomDetailPage() {
    
  const role = localStorage.getItem("user_role");
  console.log("Vai trò người dùng hiện tại:", role);
  const isOwner = role === "owner";

  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);   //State chứa danh sách review
  const [showFullDesc, setShowFullDesc] = useState(false); // Toggle xem thêm mô tả

  //Recommend
  const [recommendations, setRecommendations] = useState([]);

  // State cho form review
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  //State kiểm tra lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // THÊM STATE CHO GALLERY MODAL
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Xử lí nút xem thêm ảnh
  const openGallery = (index = 0) => {
    setPhotoIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang web
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = 'auto'; // Mở khóa cuộn
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

 const getAmenityIcon = (tagName) => {
    if (!tagName) return <CheckCircle size={18} className="text-green-500"/>;
    
    const lower = tagName.toLowerCase();

    // Logic map từ khóa sang Icon
    if (lower.includes('wifi') || lower.includes('net')) return <Wifi size={18} className="text-blue-500"/>;
    if (lower.includes('xe') || lower.includes('đỗ')) return <Car size={18} className="text-orange-500"/>;
    if (lower.includes('lạnh') || lower.includes('điều hòa')) return <Wind size={18} className="text-cyan-500"/>;
    if (lower.includes('bếp') || lower.includes('nấu') || lower.includes('ăn')) return <Utensils size={18} className="text-red-500"/>;
    if (lower.includes('bơi') || lower.includes('hồ')) return <Waves size={18} className="text-blue-400"/>;
    if (lower.includes('tv') || lower.includes('tivi')) return <Tv size={18} className="text-gray-700"/>;
    if (lower.includes('ban công') || lower.includes('sáng')) return <Sun size={18} className="text-yellow-500"/>;
    if (lower.includes('lễ tân') || lower.includes('24h')) return <User size={18} className="text-purple-500"/>;
    if (lower.includes('an ninh') || lower.includes('khóa')) return <Lock size={18} className="text-gray-600"/>;
    if (lower.includes('cafe') || lower.includes('bar')) return <Coffee size={18} className="text-brown-500"/>;

    // Icon mặc định nếu không tìm thấy từ khóa
    return <CheckCircle size={18} className="text-green-500"/>; 
};
// --- HELPER FORMAT DATE ---
  const formatDate = (dateString) => {
    if (!dateString) return "Vừa xong";
    const date = new Date(dateString);
    // Format: Ngày 27 tháng 11, 2025
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit", 
      month: "long", 
      year: "numeric"
    }).format(date);
  };

useEffect(() => {
    const token = localStorage.getItem("access_token");
    setLoading(true);
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    Promise.all([
        // 1. Chi tiết phòng
        fetch(`${API_URL}/api/accommodations/${id}`, { headers }).then(res => res.json()),

        // 2. Danh sách Review
        fetch(`${API_URL}/api/accommodations/${id}/reviews`, { headers }).then(res => res.json()),

        // 3. Gợi ý Tương tự (API MỚI)
        fetch(`${API_URL}/api/accommodations/${id}/recommendations?limit=4`, { headers }).then(res => res.json()) 
    ])
    .then(([roomData, reviewsData, recommendationsData]) => { // ⚠️ THÊM biến recommendationsData
        if (roomData.detail) throw new Error(roomData.detail);
        
        setRoom(roomData);
        // Nếu API reviews trả về lỗi hoặc null thì gán mảng rỗng
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // ⚠️ XỬ LÝ DỮ LIỆU GỢI Ý MỚI
        // (Bạn cần thêm state `recommendations` vào component của mình)
        setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
        setLoading(false);
    })
    .catch((err) => {
        console.error("Lỗi khi fetch dữ liệu chi tiết phòng:", err);
        setLoading(false);
    });
}, [id]);
  // --- HÀM GỬI REVIEW (POST) ---
  const handlePostReview = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Bạn cần đăng nhập để đánh giá!");
        navigate("/login");
        return;
    }
    if (!newReviewContent.trim()) {
        alert("Vui lòng nhập nội dung đánh giá.");
        return;
    }

    setSubmitting(true);
    try {
        const response = await fetch(`${API_URL}/api/accommodations/${id}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                rating: newReviewRating,
                content: newReviewContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Hiển thị lỗi từ backend (VD: Chưa ở đây nên không được review)
            throw new Error(data.detail || "Lỗi khi gửi đánh giá");
        }

        // Thành công: Thêm review mới lên đầu danh sách
        setReviews([data, ...reviews]); 
        setNewReviewContent(""); 
        setNewReviewRating(5);
        alert("Cảm ơn bạn đã đánh giá!");

    } catch (error) {
        alert(error.message);
    } finally {
        setSubmitting(false);
    }
  };

  // --- HELPER: Chuyển điểm số thành chữ ---
  const getRatingText = (score) => {
    if (!score) return "Mới"; 

    if (score >= 9.5) return "Xuất sắc";
    if (score >= 9.0) return "Tuyệt hảo";
    if (score >= 8.0) return "Tuyệt vời";
    if (score >= 7.0) return "Rất tốt";
    if (score >= 6.0) return "Tốt";
    if (score >= 5.0) return "Trung bình";
    return "Điểm thấp";
  };
  

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF1D2D] border-t-transparent"></div>
        <p className="ml-4 text-gray-600 font-medium">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  const getImageList = (urlString) => {
  if (!urlString) return [];
  // Tách chuỗi bằng dấu phẩy, xóa khoảng trắng thừa
  return urlString.split(',').map(url => url.trim()).filter(url => url !== "");
};

  // 2. Lấy danh sách ảnh từ room data
  // Nếu không có ảnh nào, dùng ảnh placeholder mặc định
  const images = room ? getImageList(room.picture_url) : [];
  const mainImage = images.length > 0 ? images[0] : "https://placehold.co/800x600?text=No+Image";
  const subImages = [1, 2, 3, 4]; // Các vị trí ảnh nhỏ

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-20 md:pb-0">
      
      {/* HEADER & SEARCH (Giữ nguyên thanh search dính) */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
              <Navbar />
        {/* Thanh Search nằm ngay dưới Navbar*/}
        <div className="border-t border-gray-100 pt-18 pb-4 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchingBar />
            </div>
        </div>
    </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* 1. TITLE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    {room.title}
                </h1>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} className="text-[#AD0000]" />
                    <span>{room.location}</span>
                </div>
            </div>            
        </div>

        {/* 2. GALLERY (MOSAIC) */}
        <section className="rounded-2xl overflow-hidden mb-10 relative h-[300px] md:h-[450px] w-full">
            {images.length === 0 ? (
                // CASE 0: Không có ảnh -> Hiện Placeholder
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Chưa có hình ảnh
                </div>
            ) : images.length === 1 ? (
                // CASE 1: Chỉ 1 ảnh -> Full Width
                <div className="w-full h-full relative group cursor-pointer overflow-hidden bg-gray-900 rounded-2xl">
                    
                    {/* 1. Lớp nền làm mờ (Background) */}
                    <div className="absolute inset-0">
                        <img 
                            src={images[0]} 
                            alt="Background" 
                            className="w-full h-full object-cover opacity-50 blur-xl scale-110" 
                        />
                    </div>

                    {/* 2. Ảnh chính (Foreground) */}
                    <img 
                        src={images[0]} 
                        alt="Main" 
                        className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
                    />
                </div>
            ) : images.length === 2 ? (
                // CASE 2: 2 ảnh -> Chia đôi (50-50)
                <div className="grid grid-cols-2 gap-2 h-full">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative h-full w-full overflow-hidden">
                            <img src={img} className="w-full h-full object-cover hover:scale-105 transition duration-500 cursor-pointer"/>
                        </div>
                    ))}
                </div>
            ) : images.length === 3 ? (
                // CASE 3: 1 ảnh lớn trái, 2 ảnh nhỏ phải
                <div className="grid grid-cols-3 gap-2 h-full">
                    {/* Ảnh lớn bên trái (Chiếm 2 cột) */}
                    <div className="col-span-2 h-full relative group cursor-pointer overflow-hidden">
                        <img 
                            src={images[0]} 
                            alt="Main" 
                            className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            onClick={() => openGallery(0)}
                        />
                    </div>
                    
                    {/* Cột phải: Dùng Grid Rows để chia đều chiều cao chính xác */}
                    <div className="grid grid-rows-2 gap-2 h-full">
                        <div className="relative w-full h-full group cursor-pointer overflow-hidden">
                            <img 
                                src={images[1]} 
                                alt="Sub 1" 
                                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                onClick={() => openGallery(1)}
                            />
                        </div>
                        <div className="relative w-full h-full group cursor-pointer overflow-hidden">
                            <img 
                                src={images[2]} 
                                alt="Sub 2" 
                                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                onClick={() => openGallery(2)}
                            />
                        </div>
                    </div>
                </div>
            ) : images.length === 4 ? (
                <div className="grid grid-cols-2 gap-2 h-full w-full">
                    
                    {/* --- CỘT TRÁI (Ảnh lớn nhất) --- */}
                    <div className="col-span-1 relative h-full w-full group cursor-pointer overflow-hidden">
                        <img 
                            src={images[0]} 
                            alt="Main" 
                            className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            onClick={() => openGallery(0)}
                        />
                    </div>

                    {/* --- CỘT PHẢI (Chia làm 2 hàng) --- */}
                    <div className="col-span-1 grid grid-rows-2 gap-2 h-full w-full">
                        
                        {/* Hàng trên: Ảnh thứ 2 (Rộng full cột phải) */}
                        <div className="relative h-full w-full group cursor-pointer overflow-hidden">
                            <img 
                                src={images[1]} 
                                alt="Sub 1" 
                                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                onClick={() => openGallery(1)}
                            />
                        </div>

                        {/* Hàng dưới: Chia đôi thành Ảnh 3 và Ảnh 4 */}
                        <div className="grid grid-cols-2 gap-2 h-full w-full">
                            <div className="relative h-full w-full group cursor-pointer overflow-hidden">
                                <img 
                                    src={images[2]} 
                                    alt="Sub 2" 
                                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                    onClick={() => openGallery(2)}
                                />
                            </div>
                            <div className="relative h-full w-full group cursor-pointer overflow-hidden">
                                <img 
                                    src={images[3]} 
                                    alt="Sub 3" 
                                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                    onClick={() => openGallery(3)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // CASE 5+: Layout chuẩn (1 Lớn trái, 4 Nhỏ phải)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
                    {/* Ảnh lớn */}
                    <div className="relative h-full w-full group cursor-pointer overflow-hidden">
                        <img src={images[0]} alt="Main" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    {/* Grid 4 ảnh nhỏ */}
                    <div className="hidden md:grid grid-cols-2 gap-2 h-full">
                        {images.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="relative h-full w-full group cursor-pointer overflow-hidden">
                                <img src={img} alt={`Sub ${idx}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                                
                                {/* Nếu là ảnh thứ 4 và tổng số ảnh > 5 -> Hiện lớp phủ "+X ảnh" */}
                                {idx === 3 && images.length > 5 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition">
                                        <span className="text-white font-bold text-xl">+{images.length - 5} ảnh</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nút xem tất cả ảnh (Luôn hiện nếu có ảnh) */}
            {images.length > 1 && (
                <button className="absolute bottom-5 right-5 bg-white/90 hover:bg-white text-gray-800 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm backdrop-blur-[4px] border border-white/50 ring-1 ring-black/5"
                        onClick={() => openGallery(0)}
                >
                    <Grid size={18} /> {/* Icon lưới ảnh */}
                    <span>Hiển thị tất cả ảnh</span> {/* Hiện thêm số lượng ảnh */}
                </button>
            )}
        </section>

        {/* 4. DETAILS & AMENITIES */}
        <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Các tiện ích</h2>
            {/* Grid hiển thị tiện ích từ DB */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 mb-6">
                {room.tags && room.tags.length > 0 ? (
                    room.tags.split(',').map((tag, idx) => {
                        const cleanTag = tag.trim(); // Xóa khoảng trắng thừa
                        if (!cleanTag) return null;
                        
                        return (
                            <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                {/* Gọi hàm lấy icon động */}
                                {getAmenityIcon(cleanTag)} 
                                <span className="capitalize">{cleanTag}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-sm italic">Đang cập nhật tiện ích...</p>
                )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
            <div className={`text-gray-700 leading-relaxed text-sm md:text-base relative ${!showFullDesc ? 'max-h-32 overflow-hidden' : ''}`}>
                <p className="whitespace-pre-line">{room.description}</p>
                {/* Fade effect khi thu gọn */}
                {!showFullDesc && (
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-white to-transparent pointer-events-none"/>
                )}
            </div>
            <button 
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-2 text-[#AD0000] font-semibold text-sm flex items-center gap-1 hover:underline"
            >
                {showFullDesc ? "Thu gọn" : "Xem thêm"} <ChevronDown size={16} className={`transition ${showFullDesc ? 'rotate-180' : ''}`}/>
            </button>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6 pb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chủ nhà</h2>
    
    <div className="flex items-start gap-4">
        {/* Avatar: Nếu user chưa có ảnh đại diện, dùng chữ cái đầu tên */}
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 border border-gray-300 shrink-0">
            {room.owner?.full_name ? room.owner.full_name.charAt(0).toUpperCase() : "H"}
        </div>

        <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">
                Được host bởi {room.owner?.full_name || "Chủ nhà ẩn danh"}
            </h3>
            
            <div className="text-sm text-gray-500 mt-1 space-y-1">
                {/* Email */}
                <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Email:</span> 
                    {room.owner?.email}
                </p>
                
                {/* Số điện thoại (chỉ hiện nếu có) */}
                {room.owner?.phone && (
                    <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Điện thoại:</span> 
                        {room.owner.phone}
                    </p>
                )}
            </div>                
        </div>
    </div>
            
            {/* Banner cảnh báo an toàn */}
            <div className="flex items-start gap-3 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[#AD0000] mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <p className="text-xs text-gray-500">
                    Để bảo vệ khoản thanh toán của bạn, không bao giờ chuyển tiền hoặc giao tiếp bên ngoài trang web Statch.
                </p>
            </div>
        </div>

        {/* 5. REVIEWS SECTION (RED BACKGROUND) - Thiết kế gốc */}
        <section className="bg-white rounded-2xl p-6 md:p-8 mb-10 shadow-lg text-[#AD0000]">
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Đánh giá <span className="text-sm font-normal opacity-80">({reviews.length} lượt nhận xét)</span>
                </h2>
                <button className="text-sm font-bold hover:underline flex items-center gap-1">Xem tất cả <ArrowRight size={16}/></button>
            </div>

            {/* Grid Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.length > 0 ? reviews.slice(0, 3).map((cmt, idx) => (
                    <div key={idx} className="bg-white text-gray-800 p-5 rounded-xl shadow-md flex flex-col h-full transition hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-100 to-gray-300 flex items-center justify-center font-bold text-gray-600 shrink-0 border border-gray-200">
                                {cmt.user?.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {/* Name & Stars */}
                            <div className="overflow-hidden">
                                <div className="font-bold text-sm truncate">{cmt.user?.full_name || "Ẩn danh"}</div>
                                <div className="flex text-yellow-400 text-xs mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < (cmt.rating || 5) ? "currentColor" : "none"} stroke="currentColor" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="grow">
                             <p className="text-sm text-gray-600 italic leading-relaxed">
                                "{cmt.content}"
                            </p>
                        </div>

                        {/* Date */}
                        <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-medium text-gray-400 text-right uppercase tracking-wide">
                            {formatDate(cmt.created_at)}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-3 text-center py-8 text-black/80 italic border border-white/20 rounded-xl border-dashed">
                        Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!
                    </div>
                )}
            </div>

            {/* Form viết đánh giá */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 mt-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    Chia sẻ trải nghiệm của bạn
                </h3>
                
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Chọn Sao */}
                    <div className="flex gap-1 items-center md:flex-col md:items-start md:gap-2 shrink-0">
                        <span className="text-sm font-medium opacity-90">Bạn chấm mấy điểm?</span>
                        <div className="flex bg-white rounded-full p-1 shadow-sm">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => setNewReviewRating(star)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                                        newReviewRating >= star 
                                        ? "text-yellow-400" 
                                        : "text-gray-300"
                                    } hover:scale-110`}
                                >
                                    <Star size={18} fill={newReviewRating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ô Nhập liệu */}
                    <div className="flex-1 relative">
                        <textarea
                            rows={2}
                            className="w-full min-h-[120px] pb-12 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:ring-2 focus:ring-[#AD0000]/20 focus:border-[#AD0000] outline-none transition resize-none"
                            placeholder="Phòng ốc thế nào? Dịch vụ có tốt không?..."
                            value={newReviewContent}
                            onChange={(e) => setNewReviewContent(e.target.value)}
                        />
                        <button 
                            onClick={handlePostReview}
                            disabled={submitting}
                            className="absolute bottom-3 right-2 bg-[#AD0000] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#850000] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* 6. GỢI Ý TƯƠNG TỰ (List View) */}
        <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gợi ý tương tự</h2>
            <div className="grid grid-cols-1 gap-4">
                {recommendations.length > 0 ? (
                    // Lặp qua dữ liệu thực tế từ backend
                    recommendations.map((item) => (
                        <div 
                            key={item.accommodation_id} // Dùng ID thực tế làm key
                            onClick={() => navigate(`/accommodations/${item.accommodation_id}`)}
                            className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-xl p-3 hover:shadow-md transition bg-white cursor-pointer"
                        >
                            <div className="w-full sm:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                <img src={item.picture_url || `https://placehold.co/400x300?text=${item.title}`} className="w-full h-full object-cover hover:scale-110 transition duration-500"/>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    {/* DỮ LIỆU ĐỘNG */}
                                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3> 
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12}/> {item.location} 
                                    </p>
                                    
                                    {/* Hiển thị Tags (Nếu Tags là chuỗi ngăn cách bằng dấu phẩy) */}
                                    <div className="flex gap-2 mt-2">
                                        {item.tags && item.tags.split(',').map((tag, index) => (
                                            <span key={index} className="text-[10px] border border-green-500 text-green-600 px-2 py-0.5 rounded">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    {/* DỮ LIỆU ĐỘNG */}
                                    <span className="font-bold text-xl text-[#AD0000]">{formatCurrency(item.price)} </span>
                                    {/* Giả định: Điểm đánh giá */}
                                    <span className="text-2xl font-black text-red-700">{item.rating_score || 'N/A'}<span className="text-sm font-normal text-gray-500">/10</span></span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Trường hợp không có gợi ý
                    <p className="text-gray-500">Không tìm thấy gợi ý tương tự nào.</p>
                )}
            </div>
        </section>

      </main>

      {/* THANH ĐẶT PHÒNG CỐ ĐỊNH Ở ĐÁY (FIXED BOTTOM BAR) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.08)] z-40 py-4 px-6 md:px-10 transition-transform duration-300">
          <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
              
              {/* Bên trái: Giá & Rating */}
              <div className="flex items-center gap-4">
                  {/* Khối giá tiền */}
                  <div className="flex flex-col">
                      <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-[#AD0000] leading-none">
                              {formatCurrency(room.price)}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">/ đêm</span>
                      </div>
                      <span className="text-xs text-gray-400 line-through mt-0.5">
                          {formatCurrency(room.price * 1.2)}
                      </span>
                  </div>

                  {/* Vạch ngăn cách (Chỉ hiện trên Desktop) */}
                  <div className="hidden md:block w-px h-8 bg-gray-300 mx-2"></div>

                  {/* Rating (Chỉ hiện trên Desktop) */}
                  <div className="hidden md:flex items-center gap-2">
                      <div className="bg-[#AD0000] text-white text-xs font-bold px-2 py-1 rounded">
                          {room.rating_score || "Chưa có"}
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">
                            {getRatingText(room.rating_score)}
                          </span>
                          <span className="text-[10px] text-gray-500">{reviews.length} đánh giá</span>
                      </div>
                  </div>
              </div>

              {/* Bên phải: Nút đặt phòng */}
              {!isOwner && (
                    <button 
                        onClick={() => navigate("/formpage", { state: { ...room, pricePerNight: Number(room.price) } })}
                        className="bg-[#AD0000] hover:bg-[#880000] text-white text-base md:text-lg font-bold py-3 px-8 md:px-12 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
                    >
                        ĐẶT NGAY <ArrowRight size={20} className="hidden sm:block"/>
                    </button>
                )}
          </div>
      </div>
      <div className="mb-20"> 
          <Footer/>
      </div>

      {/* 🔥 MODAL XEM ẢNH FULL SCREEN (LIGHTBOX) */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            
            {/* Nút Đóng (Góc phải trên) */}
            <button 
                onClick={closeGallery} 
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
            >
                <X size={28} />
            </button>

            {/* Nút Previous (Trái) */}
            <button 
                onClick={prevPhoto} 
                className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50 hover:scale-110"
            >
                <ChevronLeft size={32} />
            </button>

            {/* Ảnh Chính */}
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
                <img 
                    src={images[photoIndex]} 
                    alt={`Gallery ${photoIndex}`} 
                    className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
                />
            </div>

            {/* Nút Next (Phải) */}
            <button 
                onClick={nextPhoto} 
                className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50 hover:scale-110"
            >
                <ChevronRight size={32} />
            </button>

            {/* Bộ đếm số trang */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-1 rounded-full text-white text-sm font-medium tracking-widest backdrop-blur-md">
                {photoIndex + 1} / {images.length}
            </div>
        </div>
      )}
    </div>
  );
}
