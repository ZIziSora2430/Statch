import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Nếu bạn navigate từ trang chi tiết phòng bằng state,
  // có thể lấy dữ liệu ở đây:
  const bookingData = location.state || {
    roomName: "Phòng Deluxe Hướng Biển",
    hotelLocation: "Đà Nẵng, Việt Nam",
    checkin: "20/11/2025",
    checkout: "22/11/2025",
    guests: 2,
    pricePerNight: 1450000,
    nights: 2,
    totalPrice: 2900000,
    bookingCode: "STATCH-ABC123",
    guestName: "Nguyễn Văn A",
    guestEmail: "nguyenvana@example.com",
    guestPhone: "0123 456 789",
  };

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
        {/* Searching Bar (nếu muốn giữ giống các trang khác) */}
        <div className="mb-6">
          <SearchingBar />
        </div>

        {/* Card xác nhận */}
        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Đặt phòng thành công!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Cảm ơn bạn đã lựa chọn Statch. Thông tin chi tiết đơn đặt phòng
                của bạn được hiển thị bên dưới.
              </p>
            </div>
          </div>

          {/* Mã đơn + trạng thái */}
          <div className="flex flex-wrap items-center justify-between gap-2 border rounded-xl px-3 py-2 bg-gray-50">
            <div className="text-sm sm:text-base">
              <span className="text-gray-500">Mã đặt phòng: </span>
              <span className="font-semibold text-gray-900">
                {bookingData.bookingCode}
              </span>
            </div>
            <span className="inline-flex items-center px-3 py-1 text-xs sm:text-sm rounded-full bg-green-100 text-green-700 font-medium">
              Đã xác nhận
            </span>
          </div>

          {/* Thông tin chính */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Thông tin phòng */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Thông tin phòng
              </h2>
              <div className="space-y-1 text-sm sm:text-base text-gray-700">
                <p className="font-semibold text-gray-900">
                  {bookingData.roomName}
                </p>
                <p className="text-gray-500">{bookingData.hotelLocation}</p>
                <p>
                  <span className="font-semibold">Check-in:</span>{" "}
                  {bookingData.checkin}
                </p>
                <p>
                  <span className="font-semibold">Check-out:</span>{" "}
                  {bookingData.checkout}
                </p>
                <p>
                  <span className="font-semibold">Số khách:</span>{" "}
                  {bookingData.guests} người
                </p>
                <p>
                  <span className="font-semibold">Số đêm:</span>{" "}
                  {bookingData.nights} đêm
                </p>
              </div>
            </div>

            {/* Thông tin khách */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Thông tin khách đặt
              </h2>
              <div className="space-y-1 text-sm sm:text-base text-gray-700">
                <p>
                  <span className="font-semibold">Họ và tên:</span>{" "}
                  {bookingData.guestName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {bookingData.guestEmail}
                </p>
                <p>
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {bookingData.guestPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Thanh tiền */}
          <div className="border-t pt-4 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>
                Giá mỗi đêm ({bookingData.nights} đêm x{" "}
                {formatCurrency(bookingData.pricePerNight)})
              </span>
              <span>{formatCurrency(bookingData.pricePerNight * bookingData.nights)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-base sm:text-lg">
              <span>Tổng thanh toán</span>
              <span>{formatCurrency(bookingData.totalPrice)}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Giá đã bao gồm thuế và phí dịch vụ (nếu có).
            </p>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 text-xs sm:text-sm text-yellow-800">
            Vui lòng kiểm tra email để xem chi tiết đơn đặt phòng và hướng dẫn
            nhận phòng. Nếu bạn không thấy email, hãy kiểm tra thêm trong thư
            mục Spam / Quảng cáo.
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="px-5 py-2 rounded-full bg-[#BF1D2D] hover:bg-[#881818] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition"
            >
              Về trang chủ
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6 mt-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">© 2025 Statch. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4 text-xs sm:text-sm">
            <a href="#" className="hover:text-white transition">
              Về chúng tôi
            </a>
            <a href="#" className="hover:text-white transition">
              Liên hệ
            </a>
            <a href="#" className="hover:text-white transition">
              Điều khoản
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
