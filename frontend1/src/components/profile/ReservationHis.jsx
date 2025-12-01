import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Star, Check, DollarSign, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 1. Helper: Render Hạng Sao
const renderHotelClassStars = (starCount) => {
    if (!starCount || starCount < 1) return null;
    return (
        <div className="flex items-center gap-0.5 mb-1">
            {[...Array(starCount)].map((_, i) => (
                <Star key={i} size={14} fill="#FFD700" stroke="#FFD700" />
            ))}
        </div>
    );
};

// 2. Helper: Config màu sắc
const getStatusConfig = (status) => {
    switch (status) {
        case 'pending_approval':
            return { bg: 'bg-blue-600', label: 'Chờ duyệt', icon: Clock };
        case 'pending_payment':
            return { bg: 'bg-orange-500', label: 'Chờ thanh toán', icon: DollarSign };
        case 'pending_confirmation':
            return { bg: 'bg-purple-600', label: 'Chờ xác nhận', icon: Clock };
        case 'confirmed':
            return { bg: 'bg-[#00C851]', label: 'Đã đặt xong', icon: Check };
        case 'reported':
            return { bg: 'bg-red-500', label: 'Đang xử lý', icon: AlertTriangle };
        case 'cancelled':
        case 'rejected':
            return { bg: 'bg-black', label: 'Đã hủy/Từ chối', icon: X };
        case 'completed':
            return { bg: 'bg-gray-500', label: 'Hoàn thành', icon: Check };
        default:
            return { bg: 'bg-gray-400', label: 'Chờ xử lý', icon: Clock };
    }
};

// 3. Component Booking Card
const BookingCard = ({ booking }) => {
    const navigate = useNavigate();
    const config = getStatusConfig(booking.status);
    
    // Kiểm tra xem trạng thái có phải là "Đã xong/Hủy" không để phủ màu
    const isInactive = ['cancelled', 'rejected', 'completed'].includes(booking.status);
    
    const imageUrl = booking.accommodation_image 
        ? booking.accommodation_image.split(',')[0] 
        : "https://via.placeholder.com/300x200?text=No+Image";

    const formatDate = (dateStr) => {
        if(!dateStr) return "";
        const d = new Date(dateStr);
        return `T${d.getDay() + 1}, ${d.getDate()} tháng ${d.getMonth() + 1}`;
    };

    const starCount = booking.accommodation_stars || 0;

    const handleViewDetail = (e) => {
        // Ngăn chặn sự kiện nổi bọt nếu bấm vào các nút con
        e?.stopPropagation(); 
        navigate("/confirm", { state: { bookingId: booking.booking_id } });
    };
    return (
        <div className="relative flex w-full bg-white rounded-2xl shadow-md overflow-hidden mb-6 h-40 border border-gray-100 transition-transform hover:-translate-y-1 duration-300 group"
             onClick={handleViewDetail}
        >
            {isInactive && (
                <div className="absolute top-0 bottom-0 left-0 w-[72%] bg-black/40 z-20 pointer-events-none">
                </div>
            )}

            {/* LEFT: Image */}
            <div className="w-[35%] h-full relative overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={booking.accommodation_title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            {/* MIDDLE: Info */}
            <div className="flex-1 py-3 px-5 flex flex-col justify-center z-0 relative">
                <h3 className="text-lg font-extrabold text-gray-800 mb-0.5 line-clamp-1 uppercase">
                    {booking.accommodation_title}
                </h3>
                
                {renderHotelClassStars(starCount)}
                
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-500 text-xs font-medium line-clamp-1">
                         | {booking.accommodation_location || "Việt Nam"}
                    </span>
                </div>

                <div className="inline-block bg-[#AD0000] text-white text-[11px] font-bold px-4 py-1 rounded-full w-fit shadow-sm">
                    {formatDate(booking.date_start)} - {formatDate(booking.date_end)}
                </div>
            </div>

            {/* RIGHT: Status Section */}
            <div className={`relative w-[28%] h-full ${config.bg} flex flex-col items-center justify-center z-10`}>
                
                {/* SVG Separator */}
                <div className="absolute top-0 bottom-0 -left-5 w-[21px] h-full overflow-hidden pointer-events-none">
                     <svg viewBox="0 0 20 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M20,0 L20,100 L0,100 Q20,50 0,0 Z" 
                              fill={
                                  booking.status === 'confirmed' ? '#00C851' :
                                  booking.status === 'pending_approval' ? '#2563EB' : // Blue-600
                                  booking.status === 'pending_payment' ? '#F97316' : // Orange-500
                                  booking.status === 'pending_confirmation' ? '#9333EA' : // Purple-600
                                  booking.status === 'reported' ? '#EF4444' : // Red-500
                                  booking.status === 'cancelled' ? '#000000' :
                                  '#9CA3AF' // Gray
                              } 
                        />
                     </svg>
                </div>

                {/* Text Status */}
                <span className="text-white text-base md:text-lg font-extrabold tracking-wide text-center drop-shadow-sm relative z-10 px-2 leading-tight">
                    {config.label}
                </span>

                {/* NÚT THANH TOÁN (Chỉ hiện khi pending_payment) */}
                {booking.status === 'pending_payment' && (
                    <div className="mt-2 relative z-10 animate-pulse">
                        <button 
                            className="bg-white text-orange-600 text-[10px] font-bold py-1.5 px-3 rounded-full shadow-lg hover:bg-gray-100 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/confirm", { state: { bookingId: booking.booking_id } });
                            }}
                        >
                            Thanh toán ngay
                        </button>
                    </div>
                )}
                
                {/* Nút Xem chi tiết */}
                {booking.status !== 'pending_payment' && (
                     <button 
                        className="text-[10px] text-white/80 hover:text-white underline mt-2 cursor-pointer z-10"
                        onClick={handleViewDetail}
                    >
                        Xem chi tiết
                    </button>
                )}
            </div>
        </div>
    );
};

export default function HotelBookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setLoading(false); return;
            }

            try {
                const response = await fetch(`${API_URL}/api/bookings/`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setBookings(Array.isArray(data) ? data : []);
                } else {
                    setBookings([]);
                }
            } catch (error) {
                console.error(error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Render Loading
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#AD0000] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 font-medium text-sm">Đang tải lịch sử...</p>
        </div>
    );

    // Render khi không có dữ liệu
    if (bookings.length === 0) return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Hotel size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                Bạn chưa đặt phòng nào cả. Hãy khám phá những địa điểm tuyệt vời ngay thôi!
            </p>
            <button className="bg-[#AD0000] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Khám phá ngay
            </button>
        </div>
    );

    return (
        <div className="w-full h-auto pb-10 px-6 md:px-8 pt-4 -mt-10 relative">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Chỗ ở đã đặt</h1>
                    <p className="text-gray-500 text-xs font-medium mt-0.5">
                        Bạn có <span className="text-[#AD0000] font-bold">{bookings.length}</span> đơn đặt phòng
                    </p>
                </div>
            </div>

            {/* Danh sách Booking */}
            <div className="flex flex-col gap-6">
                {bookings.map((b) => (
                    <BookingCard key={b.booking_id} booking={b} />
                ))}
            </div>
        </div>
    );
}