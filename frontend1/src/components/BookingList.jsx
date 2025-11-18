import React, { useState } from 'react';

export default function HotelBookingSchedule() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      date: '5/11 - 7/11/2025',
      guest: 'Nguyễn Văn A',
      people: 2,
      roomType: 'Đặt chung (đã ghép đôi)',
    },
    {
      id: 2,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 3,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 4,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 5,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 6,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 7,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 8,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 9,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 10,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 11,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    },
    {
      id: 12,
      date: '10/11 - 11/11/2025',
      guest: 'Nguyễn Thị B',
      people: 1,
      roomType: 'Đặt cả phòng',
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    date: '',
    guest: '',
    people: 1,
    roomType: 'Đặt cả phòng'
  });

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