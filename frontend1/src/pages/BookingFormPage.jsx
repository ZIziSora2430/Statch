// src/pages/BookingFormPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RoomDetailPage from "./RoomDetailPage";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export default function BookingFormPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Lấy dữ liệu ban đầu từ state (khi chuyển từ trang Detail sang)
  const initialState = location.state || {};

  // Lấy roomId để fetch lại dữ liệu mới nhất từ DB 
  const roomId = initialState.roomId || initialState.accommodation_id;

  const getSessionFromStorage = () => {
    try {
      const saved = sessionStorage.getItem("statch_search_data");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const sessionData = getSessionFromStorage();

  // --- 2. KHỞI TẠO STATE (Logic Ưu tiên: State > Storage > Default) ---
  
  // Xử lý ngày Check-in
  const [checkin] = useState(() => {
    // Ưu tiên 1: Từ nút "Đặt ngay"
    if (initialState.checkin) return initialState.checkin;
    
    // Ưu tiên 2: Từ Session Storage (Search Bar cũ)
    if (sessionData?.startDate) {
        return new Date(sessionData.startDate).toLocaleDateString("en-CA");
    }

    // Ưu tiên 3: Mặc định hôm nay
    return new Date().toLocaleDateString("en-CA");
  });

  // Xử lý ngày Check-out
  const [checkout] = useState(() => {
    if (initialState.checkout) return initialState.checkout;
    
    if (sessionData?.endDate) {
        return new Date(sessionData.endDate).toLocaleDateString("en-CA");
    }

    return new Date(Date.now() + 86400000).toLocaleDateString("en-CA"); // Mai
  });

  // Xử lý Số khách
  const [numGuests, setNumGuests] = useState(() => {
    if (initialState.guests) return Number(initialState.guests);
    if (sessionData?.guests) return Number(sessionData.guests);
    return 1;
  });

  // --- State thông tin phòng & Form ---
  const [roomInfo, setRoomInfo] = useState({
    title: initialState.roomName || "Đang tải...",
    location: initialState.hotelLocation || "",
    price: initialState.pricePerNight || 0,
  });

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tính số đêm
  const calculateNights = (start, end) => {
      const d1 = new Date(start);
      const d2 = new Date(end);
      // Đảm bảo không lỗi nếu ngày không hợp lệ
      if (isNaN(d1) || isNaN(d2)) return 1;
      
      const diff = d2.getTime() - d1.getTime();
      const nights = Math.ceil(diff / (1000 * 3600 * 24));
      return nights > 0 ? nights : 1; 
  };
  
  const nights = calculateNights(checkin, checkout);
  const totalPrice = roomInfo.price * nights;

  // Format tiền tệ
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setLoading(true);

    if(!roomId){
        alert("Không tìm thấy thông tin phòng!");
        navigate("/"); // Quay về trang chủ nếu không có ID
        return;
    }

    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accommodations/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });
        
        if(response.ok){
          const data = await response.json(); 
          setRoomInfo({
            title : data.title,
            location : data.location,
            price : (Number(data.price))
          });
        } else {
          console.error("Lỗi lấy thông tin phòng");
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoomDetails(); 
  }, [roomId, navigate]);

  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Bạn cần đăng nhập để đặt phòng!");
        navigate("/"); 
        return;
    }


    try {
      const res = await fetch(`${API_URL}/api/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          accommodation_id: Number(roomId),
          date_start: checkin,
          date_end: checkout,
          guests: Number(numGuests),
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          note: note 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Thành công: Backend trả về object booking chứa booking_id
        console.log("Booking created:", data);
        
        // Điều hướng sang trang Confirm, truyền ID thật
        navigate("/confirm", { 
            state: { bookingId: data.booking_id } 
        });
      } else {
        // Xử lý lỗi từ backend (ví dụ: hết phòng, lỗi validation)
        alert(`Đặt phòng thất bại: ${data.detail || "Lỗi không xác định"}`);
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("Không thể kết nối đến server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Đang tải thông tin phòng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-20 pb-12 flex-1">
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
            <p className="font-semibold text-gray-900">{roomInfo.title}</p>
            <p className="text-gray-500">{roomInfo.location}</p>
            <p><span className="font-semibold">Check-in:</span> {checkin}</p>
            <p><span className="font-semibold">Check-out:</span> {checkout}</p>
            <p><span className="font-semibold">Số khách:</span> {numGuests} người</p>
            <p><span className="font-semibold">Số đêm:</span> {nights} đêm</p>
            <p><span className="font-semibold">Giá/đêm:</span> {formatCurrency(roomInfo.price)}</p>
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
