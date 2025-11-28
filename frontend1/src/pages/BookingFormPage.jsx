import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function BookingFormPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialState = location.state || {};
  const { roomId } = useParams();

  const [roomInfo, setRoomInfo] = useState({
    title: initialState.roomName || "Đang tải...",
    location: initialState.hotelLocation || "",
    price: initialState.pricePerNight || 0,
  });

  const [checkin, setCheckin] = useState(
    initialState.checkin ||
      new Date().toLocaleDateString("en-CA")
  );
  const [checkout, setCheckout] = useState(
    initialState.checkout ||
      new Date(Date.now() + 86400000).toLocaleDateString("en-CA")
  );

  const [numGuests, setNumGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const calculateNights = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkin, checkout);

  const totalPrice = roomInfo.price * nights;

  // ----------------------------
  // FETCH PHÒNG TỪ DATABASE
  // ----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/accommodations/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRoomInfo({
          title: data.title,
          location: data.location,
          price: Number(data.price),
        });
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  // ----------------------------
  // TẠO BOOKING (BACKEND)
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          accommodation_id: Number(roomId),
          date_start: checkin,
          date_end: checkout,
          guest_count: numGuests,
          note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/confirm", { state: { bookingId: data.booking_id } });
      } else {
        alert(data.detail || "Đặt phòng thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra!");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  // ----------------------------
  // UI GIỮ NGUYÊN 100%
  // ----------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] max-w-7xl pt-20 pb-12 flex-1">
        <section className="bg-white rounded-2xl shadow-sm p-7 space-y-6">

          {/* Summary */}
          <div className="border rounded-2xl bg-gray-50 p-4">
            <p className="font-semibold">{roomInfo.title}</p>
            <p>{roomInfo.location}</p>
            <p>Check-in: {checkin}</p>
            <p>Check-out: {checkout}</p>
            <p>Số đêm: {nights}</p>
            <p>Giá/đêm: {roomInfo.price.toLocaleString()}₫</p>
            <p className="font-bold text-[#BF1D2D]">
              Tổng: {totalPrice.toLocaleString()}₫
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label>Họ tên *</label>
              <input className="input" required onChange={(e) => setGuestName(e.target.value)} />
            </div>

            <div>
              <label>Số điện thoại *</label>
              <input className="input" required onChange={(e) => setGuestPhone(e.target.value)} />
            </div>

            <div>
              <label>Email *</label>
              <input className="input" required onChange={(e) => setGuestEmail(e.target.value)} />
            </div>

            <div>
              <label>Ghi chú (tuỳ chọn)</label>
              <textarea className="input" onChange={(e) => setNote(e.target.value)} />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#BF1D2D] text-white"
            >
              Tiếp tục xác nhận
            </button>
          </form>

        </section>
      </main>
    </div>
  );
}
