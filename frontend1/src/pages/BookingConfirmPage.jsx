import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

export default function BookingConfirmPage() {
  const location = useLocation();
  const { bookingId } = location.state || {};

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch(`${API_URL}/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBooking(data));
  }, [bookingId]);

  if (!booking) return <div>Đang tải...</div>;

  const nights = Math.ceil(
    (new Date(booking.date_end) - new Date(booking.date_start)) /
      (1000 * 3600 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-[92%] max-w-7xl pt-24 pb-12 flex-1">

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-bold mb-4">Xác nhận đặt phòng</h2>

          {/* giữ nguyên UI cũ */}
          <img
            src={booking.accommodation_image}
            className="w-full rounded-xl mb-4"
          />

          <h3 className="text-xl font-semibold">{booking.accommodation_title}</h3>

          <p>
            <strong>Ngày nhận phòng:</strong>{" "}
            {new Date(booking.date_start).toLocaleDateString()}
          </p>

          <p>
            <strong>Ngày trả phòng:</strong>{" "}
            {new Date(booking.date_end).toLocaleDateString()}
          </p>

          <p>
            <strong>Số đêm:</strong> {nights}
          </p>

          <p>
            <strong>Số khách:</strong> {booking.guest_count}
          </p>

          <p>
            <strong>Giá mỗi đêm:</strong>{" "}
            {booking.price_per_night.toLocaleString()}₫
          </p>

          <p className="text-[#BF1D2D] font-bold text-lg mt-2">
            Tổng tiền: {booking.total_price.toLocaleString()}₫
          </p>

          <p className="mt-3">
            <strong>Trạng thái:</strong>{" "}
            <span
              className={`font-bold ${
                booking.status === "pending"
                  ? "text-orange-500"
                  : booking.status === "confirmed"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {booking.status}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
