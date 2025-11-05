import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SearchingBar() {
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateText =
      startDate && endDate
        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        : "Chưa chọn ngày";
    alert(`Tìm: ${location} | Ngày: ${dateText} | Số khách: ${guests}`);
  };

  return (
    <div className="w-full flex justify-center mt-10">
      <div className="w-[90%] sm:w-[80%] md:w-[70%] bg-[#BF1D2D] rounded-2xl py-2 px-2 shadow-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center justify-between gap-3 sm:gap-4"
        >
          {/* Ô 1: Điểm đến */}
          <input
            type="text"
            placeholder="Điểm đến"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-40 bg-white rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Ô 2: Khoảng ngày (Date Range Picker) */}
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="Chọn khoảng ngày"
            className="flex-1 min-w-40 bg-white rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
            dateFormat="dd/MM/yyyy"
          />

          {/* Ô 3: Số khách */}
          <div className="flex items-center justify-between flex-1 min-w-40 bg-white rounded-xl px-4 py-3 text-gray-800">
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
            className="px-6 py-3 bg-[#BF1D2D] text-[#ffffff] font-semibold rounded-xl hover:bg-[#881818] active:scale-95 transition"
          >
            Tìm
          </button>
        </form>
      </div>
    </div>
  );
}
