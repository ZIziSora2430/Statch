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

useEffect(() => {
  fetch(`${API_URL}/api/accommodations/${id}`)
    .then(res => res.json())
    .then(data => setRoom(data))
    .catch(err => console.error("Error loading room:", err));
}, [id]);

if (!room) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Đang tải dữ liệu phòng...
    </div>
  );
  };

  const comments = [
    {
      name: "Nguyễn Minh Anh",
      rating: 9.2,
      content:
        "Phòng sạch sẽ, view biển đẹp, nhân viên thân thiện. Bữa sáng khá đa dạng.",
      date: "12/11/2025",
    },
    {
      name: "Trần Hoàng",
      rating: 8.8,
      content:
        "Vị trí gần biển, tiện đi dạo. Phòng hơi nhỏ hơn mình tưởng nhưng vẫn ổn.",
      date: "05/11/2025",
    },
    {
      name: "Lê Thu",
      rating: 9.6,
      content:
        "Rất hài lòng, lần sau có dịp sẽ quay lại. Rất phù hợp cho kỳ nghỉ gia đình.",
      date: "28/10/2025",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-20 pb-12 flex-1">
        {/* Searching Bar */}
        <div className="mb-6">
          <SearchingBar />
        </div>

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
          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ảnh lớn bên trái */}
              <div className="w-full h-[470px] sm:h-full bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 text-sm sm:text-base">
                  Ảnh lớn (demo)
                </span>
              </div>

              {/* 4 ảnh nhỏ 2x2 bên phải */}
              <div className="grid grid-cols-2 grid-rows-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full h-28 sm:h-[210px] bg-gray-200 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-gray-400 text-xs">Ảnh {i}</span>
                  </div>
                ))}
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

          {/* Comment Section */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Đánh giá từ khách đã ở
            </h2>

            <div className="space-y-3">
              {comments.map((cmt, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {cmt.name}
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {cmt.date}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#BF1D2D] font-semibold">
                    {cmt.rating}/10
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">
                    {cmt.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Ô nhập comment */}
            <div className="mt-4">
              <p className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                Bạn đã ở đây? Hãy để lại đánh giá:
              </p>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#BF1D2D] focus:border-[#BF1D2D]"
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
              <div className="mt-2 flex justify-end">
                <button className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-sm sm:text-base rounded-full transition">
                  Gửi đánh giá
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
                      {room.title.toLowerCase()}.
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
