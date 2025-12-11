import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, MoreVertical, Edit, Plus, MapPin, BedDouble } from "lucide-react"; // Import Icon đẹp

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function RoomCard({ id, image, category, categoryColor, name, price, status, onDelete }) {
  const [isAvailable, setIsAvailable] = useState(status === 'available');
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAvailable(status === 'available');
  }, [status]);

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HÀM XỬ LÝ TOGGLE ---
  const handleToggleStatus = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // 1. Xác định trạng thái mới
    const newStatusStr = isAvailable ? "hidden" : "available";
    
    // 2. Optimistic Update 
    const oldState = isAvailable;
    setIsAvailable(!oldState);

    try {
      const response = await fetch(`${API_URL}/api/owner/accommodations/${id}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatusStr // Chỉ gửi field cần update
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi cập nhật");
      }
      // Nếu thành công, backend trả về object đã update, ta không cần làm gì thêm vì UI đã update rồi
    } catch (error) {
      console.error("Lỗi toggle status:", error);
      // Revert lại UI nếu lỗi
      setIsAvailable(oldState);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* --- PHẦN ẢNH --- */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        <img
          src={image || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {                      
            e.target.onerror = null; 
            e.target.src = "https://res.cloudinary.com/drzs4mgqk/image/upload/v1765015038/hilton_eqr7ym.webp"; 
          }}
        />

        {/* Badge Category */}
        <div 
            className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10"
            style={{ backgroundColor: categoryColor }}
        >
          {category}
        </div>

        {/* Nút Xóa (Chỉ hiện khi hover vào card hoặc trên mobile) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-10"
          title="Xóa chỗ ở này"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* --- PHẦN THÔNG TIN --- */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-lg text-gray-800 line-clamp-1 flex-1 pr-2" title={name}>
             {name}
           </h3>
           <div ref={menuRef} className="relative">
              <button 
                onClick={() => setOpen(!open)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <MoreVertical size={20} />
              </button>
              
              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                  <button
                    onClick={() => navigate(`/modify-accommodation/${id}`)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition"
                  >
                    <Edit size={16} /> Chỉnh sửa
                  </button>
                </div>
              )}
           </div>
        </div>
        {/* Giá tiền */}
        <div className="flex justify-between items-end border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Giá mỗi đêm</p>
            <p className="text-xl font-bold text-[#AD0000]">
              {Number(price).toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Toggle Switch đẹp hơn */}
          <div className="flex flex-col items-end gap-1">
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isAvailable}
                    onChange={handleToggleStatus}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <span className={`text-[10px] font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                {isAvailable ? 'Đang hiện' : 'Đang ẩn'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashB() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategoryColor = (type) => {
    const colors = {
      'Khách sạn': '#E53935', // Đỏ
      'Biệt thự': '#00897B',  // Xanh ngọc
      'Căn hộ': '#FBC02D',    // Vàng
      'Homestay': '#43A047',  // Xanh lá
      'Resort': '#5E35B1'     // Tím
    };
    return colors[type] || '#546E7A';
  };

  useEffect(() => {
    const fetchAccommodations = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/owner/accommodations/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((item) => {
            const images = item.picture_url ? item.picture_url.split(",") : [];
            const firstImage = images.length > 0 ? images[0] : "";

            return {
              id: item.accommodation_id,
              image: firstImage || item.picture_url || "",
              name: item.title,
              price: item.price,
              category: item.property_type,
              categoryColor: getCategoryColor(item.property_type),
              status : item.status,
            };
          });
          setRooms(mappedData);
        }
      } catch (error) {
        console.error("Error fetching accommodations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chỗ ở này không?")) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/owner/accommodations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok || response.status === 204) {
        setRooms((prev) => prev.filter((room) => room.id !== id));
        // Nên dùng Toast notification thay vì alert
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.detail || "Không thể xóa"}`);
      }
    } catch (error) {
      alert("Lỗi kết nối đến server.");
    }
  };

  if (loading) return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
  );

  return (
    <div 
    style={{
      height: 980,
      overflow: 'auto'
    }}
    className="w-full bg-white px-6 md:px-10 pb-10 pt-2 relative -mt-[55px] rounded-t-2xl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-4 border-b border-gray-100">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                {/* Thanh trang trí màu đỏ */}
                <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
                
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  Danh sách chỗ ở
                </h1>
            </div>
            
            <p className="text-gray-500 text-sm ml-5 font-medium">
              Hiện tại bạn đang quản lý <span className="text-[#AD0000] font-bold text-lg">{rooms.length}</span> địa điểm
            </p>
        </div>
        
        {/* Nút Add Mobile */}
        <button 
             onClick={() => navigate('/AddAccommodationForm')}
             className="md:hidden mt-4 w-full flex justify-center items-center gap-2 bg-[#AD0000] text-white px-5 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
        >
            <Plus size={20}/> Đăng bài mới
        </button>
      </div>

      {/* Grid Danh Sách */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              {...room}
              onDelete={() => handleDeleteRoom(room.id)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <BedDouble size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Chưa có chỗ ở nào</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Bắt đầu hành trình kinh doanh của bạn bằng cách đăng tải chỗ ở đầu tiên.
            </p>
            <button 
                onClick={() => navigate('/AddAccommodationForm')}
                className="bg-[#AD0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#850000] transition shadow-md"
            >
                Đăng bài ngay
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) - Desktop Only */}
      <button
        onClick={() => navigate('/AddAccommodationForm')}
        className="hidden md:flex fixed bottom-10 right-10 group items-center gap-3 bg-white border border-gray-200 px-2 py-2 pr-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 z-50 overflow-hidden hover:border-[#AD0000]"
      >
        <div className="bg-[#AD0000] w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md group-hover:rotate-90 transition-transform duration-300">
             <Plus size={28} strokeWidth={3} />
        </div>
        <div className="flex flex-col items-start">
             <span className="text-sm font-bold text-gray-800 group-hover:text-[#AD0000] transition-colors">Đăng bài mới</span>
             <span className="text-[10px] text-gray-500">Thêm chỗ ở</span>
        </div>
      </button>

    </div>
  );
}