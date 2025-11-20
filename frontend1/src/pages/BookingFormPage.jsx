// src/pages/BookingFormPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";

export default function BookingFormPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data nhận từ trang RoomDetailPage
  const dataFromDetail = location.state || {};

  const {
    roomName = "Phòng Deluxe Hướng Biển",
    hotelLocation = "Đà Nẵng, Việt Nam",
    pricePerNight = 1450000,
    checkin = "20/11/2025",
    checkout = "22/11/2025",
    guests: initialGuests = 2,
    rooms: initialRooms = 1,    // ⬅️ thêm rooms nhận từ trước
    nights = 2,
  } = dataFromDetail;

  // state chỉnh được số khách / số phòng
  const [numGuests, setNumGuests] = useState(initialGuests);
  const [numRooms, setNumRooms] = useState(initialRooms);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [note, setNote] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  // tổng tiền theo số phòng
  const totalPrice = pricePerNight * nights * numRooms;

  const handleSubmit = (e) => {
    e.preventDefault();

    // build data để gửi sang trang xác nhận
    const bookingData = {
      roomName,
      hotelLocation,
      pricePerNight,
      checkin,
      checkout,
      guests: numGuests,      // ⬅️ dùng số khách đã chỉnh
      rooms: numRooms,        // ⬅️ số phòng đã chỉnh
      nights,
      totalPrice,
      bookingCode:
        "STATCH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      guestName,
      guestEmail,
      guestPhone,
      note,
    };

    navigate("/confirm", { state: bookingData });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-20 pb-12 flex-1">
        {/* Search bar cho đồng bộ */}
        <div className="mb-6">
          <SearchingBar />
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-7 space-y-6">
          {/* Tiêu đề */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Nhập thông tin đặt phòng
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Vui lòng điền đầy đủ thông tin bên dưới để hoàn tất đặt phòng.
            </p>
          </div>

          {/* Tóm tắt phòng bên trên */}
          <div className="border rounded-2xl px-4 py-3 bg-gray-50 space-y-1 text-sm sm:text-base">
            <p className="font-semibold text-gray-900">{roomName}</p>
            <p className="text-gray-500">{hotelLocation}</p>
            <p>
              <span className="font-semibold">Check-in:</span> {checkin}
            </p>
            <p>
              <span className="font-semibold">Check-out:</span> {checkout}
            </p>
            <p>
              <span className="font-semibold">Số khách:</span> {numGuests} người
            </p>
            <p>
              <span className="font-semibold">Số phòng:</span> {numRooms} phòng
            </p>
            <p>
              <span className="font-semibold">Số đêm:</span> {nights} đêm
            </p>
            <p className="font-semibold text-[#BF1D2D] mt-1">
              Tổng tạm tính: {formatCurrency(totalPrice)}
            </p>
          </div>

          {/* Chỉnh số khách / số phòng */}
          <div className="flex flex-wrap gap-4 items-center text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="font-medium">Số khách:</span>
              <input
                type="number"
                min={1}
                value={numGuests}
                onChange={(e) => setNumGuests(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-2 py-1 border rounded-lg text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Số phòng:</span>
              <input
                type="number"
                min={1}
                value={numRooms}
                onChange={(e) => setNumRooms(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-2 py-1 border rounded-lg text-center"
              />
            </div>
          </div>

          {/* Form thông tin khách */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#BF1D2D] focus:border-[#BF1D2D]"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#BF1D2D] focus:border-[#BF1D2D]"
                  placeholder="Ví dụ: 0123 456 789"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email nhận xác nhận *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#BF1D2D] focus:border-[#BF1D2D]"
                  placeholder="Ví dụ: email@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú cho chỗ nghỉ (tuỳ chọn)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#BF1D2D] focus:border-[#BF1D2D]"
                placeholder="Ví dụ: check-in muộn, cần thêm nôi em bé,..."
              />
            </div>

            {/* Hàng nút */}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#BF1D2D] hover:bg-[#881818] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition"
              >
                Tiếp tục xác nhận
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6 mt-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">© 2025 Statch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
