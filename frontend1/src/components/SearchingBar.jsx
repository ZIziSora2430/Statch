import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { geocodeAddress } from "../utils/geocoding";
// Nếu bạn chưa cài lucide-react thì có thể bỏ dòng import icon này đi
// npm install lucide-react
import { MapPin, Calendar, Users, Search } from "lucide-react"; 

export default function SearchingBar() {
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    
    if (location) {
        params.append("location_text", location);
        const coords = await geocodeAddress(location);
        if (coords) {
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
            params.append("radius", 10);
        }
    }

    if (startDate) params.append("checkin", startDate.toISOString().split('T')[0]);
    if (endDate) params.append("checkout", endDate.toISOString().split('T')[0]);
    params.append("guests", guests);
    
    navigate(`/search/?${params.toString()}`);
    setIsSearching(false); // Reset trạng thái tìm kiếm
  };

  return (
    // 1. BỎ HOÀN TOÀN margin-top (mt-10) và wrapper canh giữa cũ
    // Thay vào đó là w-full để nó bung lụa theo khung cha bên LandingPage
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        // 2. SỬ DỤNG CSS GRID:
        // - Mobile: 1 cột (xếp chồng lên nhau)
        // - Desktop (md): Chia tỉ lệ cột 4 - 4 - 3 - 1 (cho nút tìm)
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        
        {/* --- Ô 1: ĐIỂM ĐẾN (Chiếm 4 phần) --- */}
        <div className="md:col-span-4 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#BF1D2D]">
             <MapPin size={20} /> {/* Hoặc dùng <span>📍</span> */}
          </div>
          <input
            type="text"
            placeholder="Bạn muốn đi đâu?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#BF1D2D] focus:border-[#BF1D2D] block pl-10 p-3 outline-none hover:bg-gray-100 transition"
          />
        </div>

        {/* --- Ô 2: NGÀY (Chiếm 4 phần) --- */}
        <div className="md:col-span-4 relative group">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
             <Calendar size={20} /> {/* Hoặc dùng <span>📅</span> */}
          </div>
          <div className="w-full">
            <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="Nhận phòng - Trả phòng"
                // className cho input bên trong DatePicker
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#BF1D2D] focus:border-[#BF1D2D] block pl-10 p-3 outline-none hover:bg-gray-100 transition"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                wrapperClassName="w-full" // Quan trọng: Để DatePicker full width
            />
          </div>
        </div>

        {/* --- Ô 3: SỐ KHÁCH (Chiếm 3 phần) --- */}
        <div className="md:col-span-3 relative">
            <div className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2 px-3 hover:bg-gray-100 transition h-[46px]">
                <div className="flex items-center gap-2 text-gray-500">
                    <Users size={20} /> {/* Hoặc dùng <span>👥</span> */}
                    <span className="font-medium text-gray-700">{guests} khách</span>
                </div>
                
                {/* Nút tăng giảm nhỏ gọn hơn */}
                <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-white hover:border-[#BF1D2D] hover:text-[#BF1D2D] transition"
                >
                    -
                </button>
                <button
                    type="button"
                    onClick={() => setGuests(guests + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-white hover:border-[#BF1D2D] hover:text-[#BF1D2D] transition"
                >
                    +
                </button>
                </div>
            </div>
        </div>

        {/* --- NÚT TÌM (Chiếm 1 phần còn lại) --- */}
        <div className="md:col-span-1 h-full">
          <button
            type="submit"
            className="w-full h-[46px] bg-[#BF1D2D] hover:bg-[#a01825] text-white font-medium rounded-lg text-sm flex items-center justify-center transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Search size={20} /> // Hoặc chữ "Tìm"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}