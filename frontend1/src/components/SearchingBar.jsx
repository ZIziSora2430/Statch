import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { geocodeAddress } from "../utils/geocoding";

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
    
    // --- LOGIC GEOCODING ---
    if (location) {
        params.append("location_text", location);
        
        // 2. GỌI HÀM TỪ FILE geocoding.js
        const coords = await geocodeAddress(location);
        
        if (coords) {
            // File geocoding.js của bạn trả về { lat, lng, display_name }
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
            params.append("radius", 10); // Bán kính 10km
            console.log("📍 Tìm thấy tọa độ:", coords.lat, coords.lng);
        } else {
            console.log("⚠️ Không tìm thấy tọa độ, sẽ tìm theo tên.");
        }
    }

    if (location) {
        // Tham số location_text mà backend đang xử lý
        params.append("location_text", location); 
    }
    // Bạn có thể thêm các tham số ngày và khách, mặc dù backend chưa xử lý chúng
    if (startDate) {
        params.append("checkin", startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
        params.append("checkout", endDate.toISOString().split('T')[0]);
    }
    params.append("guests", guests);
    
    // ⚠️ ĐIỀU HƯỚNG: Chuyển sang trang /search/ và truyền tham số
    // Giả định URL cho trang kết quả là /search
    navigate(`/search/?${params.toString()}`);
  };

  
  return (
    <div className="w-full flex justify-center mt-10">
      <div className="w-[90%] sm:w-[80%] md:w-[70%] bg-[#BF1D2D] rounded-lg py-1 px-1 shadow-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-nowrap items-center justify-between gap-1 sm:gap-1"
        >
          {/* Ô 1: Điểm đến */}
          <input
            type="text"
            placeholder="Điểm đến"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-40 bg-white rounded-md px-4 py-3 h-12 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Ô 2: Khoảng ngày (Date Range Picker) */}
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="Chọn khoảng ngày"
            className="flex-1 min-w-40 bg-white rounded-md px-4 py-3 h-12 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()} // Không cho chọn ngày quá khứ
          />

          {/* Ô 3: Số khách */}
          <div className="flex items-center justify-between flex-1 min-w-40 h-12 bg-white rounded-md px-4 py-3 text-gray-800">
            <span>Số khách: {guests}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="bg-[#BF1D2D] text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setGuests(guests + 1)}
                className="bg-[#BF1D2D] text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút Tìm */}
          <button
            type="submit"
            className="px-6 py-3 bg-[#BF1D2D] text-[#ffffff] font-semibold rounded-md hover:bg-[#881818] active:scale-95 transition"
          >
            {isSearching ? "..." : "Tìm"}
          </button>
        </form>
      </div>
    </div>
  );
}
