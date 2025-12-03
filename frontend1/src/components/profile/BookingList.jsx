import React, { useState, useEffect } from "react";
import { Calendar, Users, FileText, MessageSquare, Check, X, Archive,
          Clock, BedDouble, ArrowRight, DollarSign, Eye, AlertTriangle } from "lucide-react";
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
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/owner/bookings`, {
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

  // --- HÀM DUYỆT YÊU CẦU  ---
  // Chuyển từ pending_approval -> pending_payment
  const handleApprove = async (bookingId) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/owner/bookings/${bookingId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setBookingList((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId ? { ...b, status: "pending_payment" } : b
          )
        );
        alert("Đã duyệt yêu cầu! Đang chờ khách thanh toán.");
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || "Không thể duyệt"}`);
      }
    } catch (err) {
      console.error("Lỗi approve:", err);
    }
  };

  // Xử lí accept booking 
  // Chuyển từ pending_confirmation -> confirmed
  const handleConfirm = async (bookingId) => {
    if (!confirm("Bạn xác nhận đã nhận đủ tiền và muốn chốt lịch này?")) return;
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
        alert("Đã xác nhận thanh toán thành công!");
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || "Không thể xác nhận"}`);
      }
    } catch (err) {
      console.error("Lỗi confirm:", err);
    }
  };

  const handleReport = async (bookingId) => {
    if (!confirm("Bạn chưa nhận được tiền? Hệ thống sẽ chuyển đơn này sang trạng thái 'Đang chờ xử lý' để Admin kiểm tra.")) return;

    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/owner/bookings/${bookingId}/report`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setBookingList((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId ? { ...b, status: "reported" } : b
          )
        );
        alert("Đã báo cáo. Đơn hàng đang ở trạng thái 'Đang chờ xử lý'.");
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || "Không thể báo cáo"}`);
      }
    } catch (err) {
      console.error("Lỗi report:", err);
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


  {/*Hàm helper config màu sắc */}
  const getStatusConfig = (status) => {
      switch (status) {
        case "pending_approval": // 1. Mới đặt
            return { 
                color: "border-blue-400", 
                bg: "bg-blue-50", 
                text: "text-blue-700", 
                label: "Chờ duyệt", 
                icon: Clock 
            };
        case "pending_payment": // 2. Đã duyệt, chờ tiền
            return { 
                color: "border-orange-400", 
                bg: "bg-orange-50", 
                text: "text-orange-700", 
                label: "Chờ thanh toán", 
                icon: DollarSign 
            };
        case "pending_confirmation": // 3. Khách đã chuyển, chờ check
            return { 
                color: "border-purple-500", 
                bg: "bg-purple-50", 
                text: "text-purple-700", 
                label: "Chờ xác thực tiền", 
                icon: Eye 
            };
        case "confirmed": // 4. Xong
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
        case "rejected":
             return { 
                 color: "border-red-300", 
                 bg: "bg-red-50", 
                 text: "text-red-500", 
                 label: "Đã từ chối", 
                 icon: X 
             };

        case "reported":
            return { 
                color: "border-red-500", 
                bg: "bg-red-50", 
                text: "text-red-600", 
                label: "Đang chờ xử lý", 
                icon: AlertTriangle 
            };
        case "completed":
            return { 
                color: "border-slate-500", 
                bg: "bg-slate-100", 
                text: "text-slate-600", 
                label: "Đã trả phòng", 
                icon: Archive
            };

        default:
            return { color: "border-gray-200", bg: "bg-white", text: "text-gray-600", label: status, icon: FileText };
      }
  };
  return (
    <div 
    style={{
      maxHeight: 980,
      minHeight: 538,
      overflow: 'auto'
    }}
    className="w-full px-6 md:px-10 pb-10 pt-2 relative -mt-[55px]">
      
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

                    {/* --- HIỂN THỊ ẢNH CHUYỂN KHOẢN (Nếu có) --- */}
                    {booking.payment_proof && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                             <p className="text-xs font-bold text-gray-500 mb-2">Ảnh biên lai chuyển khoản:</p>
                             <a 
                                href={`${API_URL}/${booking.payment_proof}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 underline text-sm hover:text-blue-800"
                             >
                                Bấm vào đây để xem ảnh xác thực
                             </a>
                        </div>
                    )}

                   {/* --- ACTION BUTTONS (Logic mới) --- */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        
                        {/* 1. Mới đặt -> Duyệt hoặc Từ chối */}
                        {booking.status === "pending_approval" && (
                            <>
                                <button
                                    onClick={() => handleCancel(booking.booking_id)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                                >
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => handleApprove(booking.booking_id)}
                                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <Check size={16} /> Duyệt yêu cầu
                                </button>
                            </>
                        )}

                        {/* 2. Chờ khách chuyển tiền */}
                        {booking.status === "pending_payment" && (
                             <span className="text-orange-600 text-sm font-medium italic flex items-center gap-1">
                                <Clock size={14}/> Đang chờ khách thanh toán...
                             </span>
                        )}

                        {/* 3. Khách đã chuyển -> CHỈ CÓ: Báo cáo & Xác nhận (Không cho hủy) */}
                        {booking.status === "pending_confirmation" && (
                            <>
                                {/* Nút Báo cáo */}
                                <button
                                    onClick={() => handleReport(booking.booking_id)} 
                                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition flex items-center gap-2"
                                >
                                    <AlertTriangle size={16} /> Chưa nhận được tiền?
                                </button>

                                {/* Nút Xác nhận */}
                                <button
                                    onClick={() => handleConfirm(booking.booking_id)}
                                    className="px-6 py-2 rounded-lg bg-[#AD0000] text-white font-bold text-sm shadow-md hover:bg-[#850000] transition transform active:scale-95 flex items-center gap-2"
                                >
                                    <Check size={16} /> Xác nhận đã nhận tiền
                                </button>
                            </>
                        )}

                        {/* 4. Đã báo cáo -> Chỉ hiện thông báo */}
                        {booking.status === "reported" && (
                            <span className="text-red-600 text-sm font-medium italic flex items-center gap-1">
                                <AlertTriangle size={14}/> Yêu cầu đang được Admin xử lý tranh chấp.
                            </span>
                        )}

                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}