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

  // State để lưu file user chọn
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  
  useEffect(() => {
    // Nếu không có ID (ví dụ user F5 lại trang), điều hướng về trang chủ hoặc báo lỗi
    if (!bookingId) {
      alert("Không tìm thấy booking. Vui lòng thử lại."); 
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
        // Map dữ liệu từ Backend (snake_case) sang Frontend (camelCase)

      const mappedData = {
    bookingId: data.booking_id,
    bookingCode: data.booking_code,
    status: data.status,
    roomName: data.accommodation_title,
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
    ownerName: data.owner?.full_name,
    ownerEmail: data.owner?.email,
    ownerPhone: data.owner?.phone,
};

        
        // 4. Sửa setBooking -> setBookingData
        setBookingData(mappedData);
      })
      .catch((err) => console.error("Lỗi fetch:", err));
  }, [bookingId, navigate]);


  // Hàm upload ảnh
  const handleUpload = async () => {
    if (!selectedFile) return alert("Vui lòng chọn ảnh!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/bookings/${bookingData.bookingId}/upload-proof`, { 
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${token}` 
            }, 
            body: formData
        });
        
        if (res.ok) {
            alert("Đã gửi xác nhận thanh toán!");
            window.location.reload(); // Reload để cập nhật trạng thái mới
        } else {
            alert("Lỗi upload.");
        }
    } catch (e) {
        alert("Lỗi kết nối.");
    } finally {
        setUploading(false);
    }
  };

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
        {/* PHẦN STATUS BAR MỚI */}
          <div className="border rounded-xl p-4 bg-gray-50 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Trạng thái đơn hàng</h3>
            
            {/* TRƯỜNG HỢP 1: Mới đặt -> Chờ duyệt */}
            {bookingData.status === "pending_approval" && (
                <div className="text-orange-600 flex items-center gap-2">
                    <span>⏳</span> 
                    <span>Đang chờ chủ nhà duyệt yêu cầu. Bạn chưa cần thanh toán lúc này.</span>
                </div>
            )}

            {/* TRƯỜNG HỢP 2: Đã duyệt -> Hiện QR Code & Nút Upload */}
            {bookingData.status === "pending_payment" && (
                <div className="space-y-4">
                    <div className="text-green-600 font-medium">
                        ✅ Chủ nhà đã đồng ý! Vui lòng chuyển khoản để giữ phòng.
                    </div>
                    
                    {/* Khu vực thông tin chuyển khoản (Demo) */}
                    <div className="bg-white p-4 border border-blue-200 rounded-lg">
                        <p className="font-bold text-gray-700">Thông tin chuyển khoản:</p>
                        <p>Ngân hàng: <span className="font-mono">MB Bank</span></p>
                        <p>Số tài khoản: <span className="font-mono font-bold text-lg">9999 8888 7777</span></p>
                        <p>Chủ tài khoản: <span className="uppercase">NGUYEN VAN CHU NHA</span></p>
                        <p>Nội dung: <span className="font-bold text-red-600">{bookingData.bookingCode}</span></p>
                    </div>

                    {/* Form Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Tải lên ảnh biên lai:</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button 
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {uploading ? "Đang gửi..." : "Xác nhận đã chuyển khoản"}
                        </button>
                    </div>
                </div>
            )}

            {/* TRƯỜNG HỢP 3: Đã upload -> Chờ confirm */}
            {bookingData.status === "pending_confirmation" && (
                <div className="text-blue-600 flex items-center gap-2">
                    <span>Bạn đã gửi minh chứng thanh toán. Đang chờ chủ nhà xác nhận chuyển khoản thành công.</span>
                </div>
            )}

            {/* TRƯỜNG HỢP 4: Thành công */}
            {bookingData.status === "confirmed" && (
                <div className="text-green-600 font-bold flex items-center gap-2">
                    <span>🎉</span>
                    <span>Đặt phòng thành công! Hãy chuẩn bị hành lý.</span>
                </div>
            )}
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
              <p className="pt-2 font-semibold text-gray-900">Thông tin chủ nhà</p>
<p>
  <span className="font-semibold">Họ tên:</span>{" "}
  {bookingData.ownerName || "Ẩn danh"}
</p>
<p>
  <span className="font-semibold">Email:</span>{" "}
  {bookingData.ownerEmail || "Không có"}
</p>
<p>
  <span className="font-semibold">SĐT:</span>{" "}
  {bookingData.ownerPhone || "Không có"}
</p>

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