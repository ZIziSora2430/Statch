import React, { useState } from 'react';

export default function HotelBookingSchedule() {
  const [bookingList, setBookingList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    date: '',
    guest: '',
    people: 1,
    roomType: 'Đặt cả phòng'
  });
  
  useEffect(() => {
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/owner/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setBookingList(data);
    } catch (error) {
      console.error("Lỗi load booking:", error);
    }
  };

  fetchBookings();
}, []);


  const handleAddBooking = () => {
    if (newBooking.date && newBooking.guest) {
      setBookings([...bookings, {
        id: Date.now(),
        ...newBooking,
      }]);
      setNewBooking({ date: '', guest: '', people: 1, roomType: 'Đặt cả phòng' });
      setShowForm(false);
    }
  };

  const handleDeleteBooking = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <div>
      <div style={{
        position: 'absolute',
        width: 875,
        height: 900,
        top: 70,
        right: 25,
        overflowY: 'auto'
      }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400 relative group">
              <button
                onClick={() => handleDeleteBooking(booking.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                title="Xóa đặt phòng"
              >
                Xóa
              </button>
              
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Ngày: {booking.date}
              </h2>
              
              <div className="border-l-4 border-black pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Khách:</span>
                  <span>{booking.guest}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Số lượng:</span>
                  <span>{booking.people} người</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Loại:</span>
                  <span>{booking.roomType}</span>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">Chưa có đặt phòng nào</p>
              <p className="text-sm">Nhấn nút bên dưới để thêm đặt phòng mới</p>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}