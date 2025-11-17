import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

export default function SearchingBar() {
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
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
            Tìm
          </button>
        </form>
      </div>
    </div>
  );
}
