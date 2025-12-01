import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// 1. Định nghĩa API_URL để tránh lỗi reference
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Lấy bookingId từ state (được truyền từ trang BookingForm)
  // Dùng toán tử ?. để tránh lỗi nếu state bị null
  const bookingId = location.state?.bookingId;

  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Nếu không có ID (ví dụ user F5 lại trang), điều hướng về trang chủ hoặc báo lỗi
    if (!bookingId) {
      alert("Không tìm thấy mã đơn hàng. Vui lòng thử lại."); 
      return;
    }

    const token = localStorage.getItem("access_token");

    console.log("Fetching:", `${API_URL}/api/bookings/${bookingId}`);

    fetch(`${API_URL}/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // 3. QUAN TRỌNG: Map dữ liệu từ Backend (snake_case) sang Frontend (camelCase)
        // Backend trả về: accommodation_title, date_start...
        // Frontend đang cần: roomName, checkin...
        const mappedData = {
            bookingCode: data.booking_code,
            status: data.status,
            roomName: data.accommodation_title, // Lấy từ accommodation_title
            hotelLocation: data.accommodation_location,
            checkin: data.date_start,
            checkout: data.date_end,
            guests: data.guests,
            guestName: data.guest_name, 
            guestEmail: data.guest_email,
            guestPhone: data.guest_phone,
            fullNote: data.note,
            nights: data.nights,
            pricePerNight: data.price_per_night,
            totalPrice: data.total_price,
        };
        
        // 4. Sửa setBooking -> setBookingData
        setBookingData(mappedData);
      })
      .catch((err) => console.error("Lỗi fetch:", err));
  }, [bookingId, navigate]); // Thêm dependencies

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  if (!bookingData) {
    return <div className="pt-20 text-center">Đang tải thông tin đặt phòng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-20 pb-12 flex-1">
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
            <span className={
              "inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-medium " +
              (bookingData.status === "pending_confirmation"
                  ? "bg-yellow-100 text-yellow-700"
                  : bookingData.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600")
            }>
              {bookingData.status === "pending_confirmation"
                ? "Chờ chủ nhà xác nhận"
                : bookingData.status === "confirmed"
                ? "Đã xác nhận"
                : bookingData.status === "cancelled"
                ? "Đã hủy"
                : "Không xác định"}
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
              <span>
                {formatCurrency(
                  bookingData.pricePerNight * bookingData.nights
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-base sm:text-lg">
              <span>Tổng thanh toán</span>
              <span>{formatCurrency(bookingData.totalPrice)}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Giá đã bao gồm thuế và phí dịch vụ (nếu có).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/home")} 
              className="px-4 py-2 rounded-full border border-[#BF1D2D] text-sm sm:text-base text-[#BF1D2D] hover:bg-red-50 transition"
            >
              Đặt phòng khác
            </button>

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
      
      {/* Footer giữ nguyên */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">© 2025 Statch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}