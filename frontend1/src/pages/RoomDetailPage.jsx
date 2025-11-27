// src/pages/RoomDetailPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function RoomDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);   //State chứa danh sách review

  // State cho form review
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  //State kiểm tra lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// --- HELPER FORMAT DATE ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

useEffect(() => {
    const token = localStorage.getItem("access_token");
    setLoading(true);

    // Gọi song song 2 API: Chi tiết phòng & Danh sách Review
    Promise.all([
      fetch(`${API_URL}/api/accommodations/${id}`, {
         headers: token ? { "Authorization": `Bearer ${token}` } : {}
      }).then(res => res.json()),

      fetch(`${API_URL}/api/accommodations/${id}/reviews`, {
         headers: token ? { "Authorization": `Bearer ${token}` } : {}
      }).then(res => res.json())
    ])
    .then(([roomData, reviewsData]) => {
        if (roomData.detail) throw new Error(roomData.detail);
        
        setRoom(roomData);
        // Nếu API reviews trả về lỗi hoặc null thì gán mảng rỗng
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setLoading(false);
    })
    .catch((err) => {
        console.error(err);
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
  
  const similarRooms = [
    {
      name: "Phòng Superior Hướng Thành Phố",
      location: "Đà Nẵng, Việt Nam",
      pricePerNight: 950000,
    },
    {
      name: "Phòng Deluxe Gia Đình",
      location: "Đà Nẵng, Việt Nam",
      pricePerNight: 1750000,
    },
    {
      name: "Phòng Suite Hướng Biển",
      location: "Đà Nẵng, Việt Nam",
      pricePerNight: 2250000,
    },
  ];

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50 bg-white shadow-md">
              <Navbar />
              
        {/* Thanh Search nằm ngay dưới Navbar, có viền ngăn cách nhẹ */}
        <div className="border-t border-gray-100 pt-18 pb-4 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchingBar />
            </div>
        </div>
      </div>
      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-20 pb-12 flex-1">
        

        {/* Title + Location */}
        <section className="mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {room.title}
          </h1>

          {/* Địa điểm đặt dưới tiêu đề */}
          <div className="mt-2 text-gray-600 text-sm sm:text-base">
            {room.location}
          </div>
        </section>

        {/* Content */}
        <section className="space-y-6">
         <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* ẢNH LỚN BÊN TRÁI (Lấy ảnh đầu tiên) */}
              <div className="w-full h-[300px] sm:h-[400px] lg:h-[470px] bg-gray-200 rounded-xl overflow-hidden relative group">
                <img 
                  src={mainImage} 
                  alt={room?.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {e.target.src = "https://placehold.co/800x600?text=Error"}}
                />
              </div>

                {/* 4 ẢNH NHỎ BÊN PHẢI (Lấy ảnh thứ 2,3,4,5) */}
                <div className="grid grid-cols-2 grid-rows-2 gap-3">
                  {subImages.map((offset) => {
                    const imgUrl = images[offset]; // Lấy ảnh tại index 1, 2, 3, 4
                    return (
                      <div
                        key={offset}
                        className="w-full h-32 sm:h-full bg-gray-100 rounded-xl overflow-hidden relative"
                      >
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={`Chi tiết ${offset}`} 
                            className="w-full h-full object-cover hover:opacity-90 transition"
                            onError={(e) => {e.target.style.display = 'none'}} // Ẩn nếu lỗi ảnh
                          />
                        ) : (
                          // Nếu không đủ ảnh thì hiện ô trống hoặc placeholder mờ
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          {/* Rating + Button + Price trên cùng hàng */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            {/* Rating bên trái */}
            <div className="text-gray-700 text-sm sm:text-base">
              <span className="font-semibold text-gray-900">
                {room.rating ? (room.rating * 2).toFixed(1) : "9.2"}
              </span>
              /10 ({room.reviews} đánh giá)
            </div>

            {/* Nút + Giá nằm sát nhau bên phải */}
            <div className="flex items-center gap-2">
              {/* Nút Đặt ngay */}
              <button
                className="px-6 py-2 bg-[#BF1D2D] hover:bg-[#881818] text-white font-semibold text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition"
                onClick={() =>
                  navigate("/formpage", {
                    state: {
                      roomName: room.title,
                      hotelLocation: room.location,
                      pricePerNight: Number(room.price),
                      roomId: room.accommodation_id, 
                    },
                  })
                }

              >
                Đặt ngay
              </button>

              {/* Giá sát bên phải nút */}
              <div className="text-sm sm:text-base font-semibold text-[#BF1D2D]">
                {formatCurrency(room.price)}/đêm
              </div>
            </div>
          </div>

          {/* Thông tin phòng + Tiện ích */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Thông tin phòng
            </h2>

            {/* TIỆN ÍCH (ở trên) */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Tiện ích phòng
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.tags &&
                  room.tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm text-gray-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}

              </div>
            </div>

            {/* MÔ TẢ */}
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {room.description}
            </p>

            {/* THÔNG SỐ CƠ BẢN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 mt-3">
            </div>
          </div>

          {/* --- REVIEW SECTION --- */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">Đánh giá từ khách hàng</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm font-bold">{reviews.length}</span>
            </div>

            {/* List Reviews */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {reviews.length > 0 ? (
                reviews.map((cmt) => (
                  <div key={cmt.review_id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                          <p className="font-bold text-gray-900">{cmt.user?.full_name || "Ẩn danh"}</p>
                          <div className="flex text-yellow-400 text-sm">
                              {"★".repeat(cmt.rating)}{"☆".repeat(5 - cmt.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(cmt.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-2 bg-gray-50 p-3 rounded-lg">{cmt.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">Chưa có đánh giá nào.</div>
                )}
              </div>

              {/* Post Review Form */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-3">Viết đánh giá của bạn</h3>
                
                {/* Star Selection */}
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                      <button 
                          key={star} onClick={() => setNewReviewRating(star)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                              newReviewRating === star ? "bg-[#BF1D2D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                      >
                          {star}
                      </button>
                  ))}
                  <span className="self-center text-sm text-gray-500 ml-2">Sao</span>
                </div>

                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1D2D]"
                  placeholder="Bạn cảm thấy thế nào về chuyến đi?..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button 
                      onClick={handlePostReview}
                      disabled={submitting}
                      className="px-6 py-2 bg-gray-900 hover:bg-black text-white font-medium rounded-full transition disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
          </div>

          {/* Gợi ý phòng tương tự */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Phòng tương tự bạn có thể thích
            </h2>

            <div className="space-y-4">
              {similarRooms.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 sm:gap-4 pb-4 border-b last:border-b-0 border-gray-100"
                >
                  {/* Ảnh nhỏ bên trái */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg shrink-0" />

                  {/* Nội dung bên phải */}
                  <div className="flex-1">
                    <button className="text-sm sm:text-base text-[#1a0dab] font-medium hover:underline text-left">
                      {item.name}
                    </button>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {item.location}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 mt-1">
                      Phòng tại {item.location?.toLowerCase()} với mức giá phù
                      hợp, là lựa chọn thay thế cho{" "}
                      {room.title ? room.title.toLowerCase() : "phòng hiện tại"}.
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#BF1D2D] mt-1">
                      {formatCurrency(item.pricePerNight)}/đêm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    <Footer/>
    </div>
  );
}
