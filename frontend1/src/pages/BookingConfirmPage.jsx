// src/pages/BookingConfirmPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Nếu bạn navigate từ trang trước có truyền state thì lấy ra,
  // nếu không sẽ dùng dữ liệu mặc định để không bị lỗi trắng trang.
  const [bookingData, setBookingData] = React.useState(null);

  React.useEffect(() => {
  if (!location.state?.bookingId) return;

  fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${location.state.bookingId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(data => setBookingData(data))
    .catch(err => console.error("Error loading booking:", err));
}, []);


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
            {/* NÚT ĐẶT PHÒNG KHÁC  */}
            <button
              type="button"
              onClick={() => navigate("/booking")} // route tới trang chọn phòng
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

     <Footer/>
    </div>
  );
}
