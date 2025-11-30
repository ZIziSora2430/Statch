import React, { useState, useEffect } from "react";
import { Calendar, Users, FileText, MessageSquare, Check, X, Clock, BedDouble, ArrowRight } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function BookingList() {
  const [bookingList, setBookingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function để lấy token
  const getToken = () => localStorage.getItem("access_token"); 
  // Format tiền tệ
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Load danh sách booking của Owner
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // const token = localStorage.getItem("token");
        const token = localStorage.getItem("access_token");

        // const res = await fetch(
        //   `${import.meta.env.VITE_API_URL}/api/owner/bookings`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );

const res = await fetch('http://127.0.0.1:8000/api/owner/bookings', {
  headers: { Authorization: `Bearer ${token}` }
});

        const data = await res.json();
        console.log("Dữ liệu booking nhận được:", data);
        setBookingList(data);
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Xử lí accept booking 
  const handleConfirm = async (bookingId) => {
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

  /// 2. Helper: Config màu sắc & Icon theo trạng thái
  const getStatusConfig = (status) => {
      switch (status) {
        case "pending_confirmation":
            return { 
                color: "border-yellow-400", 
                bg: "bg-yellow-50", 
                text: "text-yellow-700", 
                label: "Chờ xác nhận", 
                icon: Clock 
            };
        case "confirmed":
            return { 
                color: "border-green-500", 
                bg: "bg-green-50", 
                text: "text-green-700", 
                label: "Đã xác nhận", 
                icon: Check 
            };
        case "cancelled":
            return { 
                color: "border-gray-300", 
                bg: "bg-gray-100", 
                text: "text-gray-500", 
                label: "Đã hủy", 
                icon: X 
            };
        default:
            return { color: "border-gray-200", bg: "bg-white", text: "text-gray-600", label: status, icon: FileText };
      }
  };

  return (
    <div className="w-full h-auto px-6 md:px-10 pb-10 pt-2 relative -mt-[55px]">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
          <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Quản lý đặt phòng</h1>
              <p className="text-sm text-gray-500">Bạn có <span className="font-bold text-[#AD0000]">{bookingList.length}</span> yêu cầu đặt phòng</p>
          </div>
      </div>

      {/* Empty State */}
      {!loading && bookingList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Calendar size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Chưa có đặt phòng nào</h3>
            <p className="text-gray-500">Hiện tại chưa có khách hàng nào đặt phòng của bạn.</p>
          </div>
      )}

      {/* Booking List */}
      <div className="flex flex-col gap-6">
        {bookingList.map((booking) => {
          const statusConfig = getStatusConfig(booking.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={booking.booking_id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden relative group`}
            >
                {/* Thanh màu trạng thái bên trái */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${statusConfig.color.replace('border', 'bg')}`}></div>

                <div className="p-5 pl-7">
                    {/* Hàng 1: ID - Trạng thái - Giá */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                #{booking.booking_code || booking.booking_id}
                            </span>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon size={12} /> {statusConfig.label}
                            </span>
                        </div>
                        <div className="text-xl font-bold text-[#AD0000]">
                            {formatCurrency(booking.total_price)}
                        </div>
                    </div>

                    {/* Hàng 2: Grid thông tin chi tiết */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-700">
                        {/* Cột trái */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BedDouble size={16} className="text-gray-400" />
                                <span className="font-semibold text-gray-900">{booking.accommodation_title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                <span>
                                    {booking.date_start} <ArrowRight size={12} className="inline mx-1"/> {booking.date_end}
                                    <span className="ml-2 text-gray-400">({booking.nights} đêm)</span>
                                </span>
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-gray-400" />
                                <span>{booking.guests} khách</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                                <span className="italic text-gray-500">
                                    "{booking.note || "Khách không để lại ghi chú"}"
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hàng 3: Action Buttons (Chỉ hiện khi Pending) */}
                    {booking.status === "pending_confirmation" && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleCancel(booking.booking_id)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                            >
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleConfirm(booking.booking_id)}
                                className="px-6 py-2 rounded-lg bg-[#AD0000] text-white font-bold text-sm shadow-md hover:bg-[#850000] transition transform active:scale-95 flex items-center gap-2"
                            >
                                <Check size={16} /> Chấp nhận đơn
                            </button>
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}