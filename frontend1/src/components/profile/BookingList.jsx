import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function BookingList() {
  const [bookingList, setBookingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function để lấy token
  const getToken = () => localStorage.getItem("access_token"); // Đổi thành access_token cho đồng bộ

  // Load danh sách booking của Owner
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = getToken();
        // SỬA URL: Dựa vào owner_router.py, prefix là /api/owner/bookings
        const res = await fetch(
          `${API_URL}/api/owner/bookings`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setBookingList(data);
        } else {
          console.error("Lỗi tải danh sách đặt phòng");
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // XỬ LÝ: CHẤP NHẬN (CONFIRM)
  const handleConfirm = async (bookingId) => {
    if (!confirm("Bạn có chắc muốn xác nhận đơn này?")) return;

    try {
      const token = getToken();
      // Gọi endpoint confirm trong owner_router.py
      const res = await fetch(
        `${API_URL}/api/owner/bookings/${bookingId}/confirm`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Cập nhật lại UI ngay lập tức
        setBookingList((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId ? { ...b, status: "confirmed" } : b
          )
        );
        alert("Đã xác nhận đặt phòng!");
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || "Không thể xác nhận"}`);
      }
    } catch (err) {
      console.error("Lỗi confirm:", err);
    }
  };

  // XỬ LÝ: TỪ CHỐI / HỦY (CANCEL)
  const handleCancel = async (bookingId) => {
    if (!confirm("Bạn có chắc muốn từ chối đơn này?")) return;

    try {
      const token = getToken();
      // Gọi endpoint cancel trong owner_router.py
      const res = await fetch(
        `${API_URL}/api/owner/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Cập nhật lại UI ngay lập tức
        setBookingList((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId ? { ...b, status: "cancelled" } : b
          )
        );
        alert("Đã hủy đơn đặt phòng!");
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || "Không thể hủy"}`);
      }
    } catch (err) {
      console.error("Lỗi cancel:", err);
    }
  };

  // Hàm render trạng thái cho đẹp
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending_confirmation":
        return <span className="text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded">Chờ xác nhận</span>;
      case "confirmed":
        return <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Đã xác nhận</span>;
      case "cancelled":
        return <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">Đã hủy</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: 875,
        height: 900,
        top: 70,
        right: 25,
        overflowY: "auto",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quản lý đặt phòng</h1>

        {loading && <p>Đang tải dữ liệu...</p>}

        {!loading && bookingList.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Chưa có đặt phòng nào</p>
          </div>
        )}

        {bookingList.map((booking) => (
          <div
            key={booking.booking_id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400 relative group transition hover:shadow-lg"
          >
            {/* Header: Ngày tháng & Giá */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-[#BF1D2D]">
                {booking.date_start} → {booking.date_end} 
                <span className="text-gray-500 text-sm font-normal ml-2">({booking.nights} đêm)</span>
              </h2>
              <span className="font-semibold text-gray-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price)}
              </span>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
               <div>
                  <p className="flex gap-2"><span className="font-semibold">Mã đơn:</span> {booking.booking_code}</p>
                  <p className="flex gap-2"><span className="font-semibold">Phòng:</span> {booking.accommodation_title}</p>
                  <p className="flex gap-2"><span className="font-semibold">Số khách:</span> {booking.guests}</p>
               </div>
               <div>
                  {/* Note: User ID cần join bảng User để lấy tên, tạm thời hiển thị ID hoặc Note */}
                  <p className="flex gap-2"><span className="font-semibold">Ghi chú của khách:</span> {booking.note || "Không có"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-semibold">Trạng thái:</span>
                    {renderStatusBadge(booking.status)}
                  </div>
               </div>
            </div>

            {/* ACTION BUTTONS */}
            {booking.status === "pending_confirmation" && (
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => handleCancel(booking.booking_id)}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleConfirm(booking.booking_id)}
                  className="px-4 py-2 rounded bg-[#BF1D2D] hover:bg-[#a01826] text-white font-medium shadow transition"
                >
                  Chấp nhận đơn
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}