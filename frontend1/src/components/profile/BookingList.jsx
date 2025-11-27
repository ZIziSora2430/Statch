import React, { useState, useEffect } from "react";

export default function BookingList() {
  const [bookingList, setBookingList] = useState([]);

  // Load booking từ BACKEND
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookings/owner`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setBookingList(data);
      } catch (error) {
        console.error("Lỗi load booking:", error);
      }
    };

    fetchBookings();
  }, []);

  // XÓA BOOKING THẬT (OWNER DELETE)
  const handleDeleteBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/owner/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setBookingList(bookingList.filter((b) => b.booking_id !== bookingId));
      }
    } catch (err) {
      console.error("Lỗi xóa booking:", err);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {bookingList.map((booking) => (
          <div
            key={booking.booking_id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400 relative group"
          >
            <button
              onClick={() => handleDeleteBooking(booking.booking_id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              title="Xóa đặt phòng"
            >
              Xóa
            </button>

            <h2 className="text-xl font-bold text-red-600 mb-4">
              Ngày: {booking.date_start} → {booking.date_end}
            </h2>

            <div className="border-l-4 border-black pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Khách:</span>
                <span>{booking.traveler_name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Số lượng:</span>
                <span>{booking.guests} người</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Chỗ ở:</span>
                <span>{booking.accommodation_title}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                <span>{booking.status}</span>
              </div>
            </div>
          </div>
        ))}

        {bookingList.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Chưa có đặt phòng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
