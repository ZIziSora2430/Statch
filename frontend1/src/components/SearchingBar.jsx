import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { geocodeAddress } from "../utils/geocoding";
import { MapPin, Calendar, Users, Search } from "lucide-react"; 

export default function SearchingBar({ initialLocation }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getInitialLocation = () => {
    // Nếu có prop từ cha truyền xuống (ví dụ click từ gợi ý trang chủ)
    if (initialLocation) return initialLocation;
    
    // Nếu trên URL có (ví dụ: /search?location_text=ABC)
    const urlLoc = searchParams.get("location_text");
    if (urlLoc) return urlLoc;

    // Cuối cùng lấy từ Storage
    const saved = sessionStorage.getItem("statch_search_data");
    return saved ? JSON.parse(saved).location : "";
  };

  const getInitialDates = () => {
    // Check URL trước
    const urlCheckin = searchParams.get("checkin");
    const urlCheckout = searchParams.get("checkout");
    if (urlCheckin && urlCheckout) {
        return [new Date(urlCheckin), new Date(urlCheckout)];
    }

    // Check Storage
    const saved = sessionStorage.getItem("statch_search_data");
    if (saved) {
        const { startDate, endDate } = JSON.parse(saved);
        // Cần convert chuỗi ISO về Date Object cho DatePicker
        return [
            startDate ? new Date(startDate) : null, 
            endDate ? new Date(endDate) : null
        ];
    }
    return [null, null];
  };

  const getInitialGuests = () => {
    const urlGuests = searchParams.get("guests");
    if (urlGuests) return Number(urlGuests);

    const saved = sessionStorage.getItem("statch_search_data");
    return saved ? JSON.parse(saved).guests : 1;
  };

  const [location, setLocation] = useState(getInitialLocation);
  const [dateRange, setDateRange] = useState(getInitialDates);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(getInitialGuests);
  const [isSearching, setIsSearching] = useState(false);


  // --- 2. TỰ ĐỘNG LƯU VÀO SESSION STORAGE KHI NHẬP ---
  useEffect(() => {
    const dataToSave = {
        location,
        startDate: startDate ? startDate.toISOString() : null, // Lưu dưới dạng string chuẩn
        endDate: endDate ? endDate.toISOString() : null,
        guests
    };
    sessionStorage.setItem("statch_search_data", JSON.stringify(dataToSave));
  }, [location, startDate, endDate, guests]);

  
  // Hàm format ngày
  const formatDate = (date) => {
      if (!date) return "";
      return date.toLocaleDateString('en-CA');
  };

  // --- 1. HÀM XỬ LÝ TÌM KIẾM CHUNG ---
  const executeSearch = async (searchLocation) => {
    setIsSearching(true);
    try {
        const params = new URLSearchParams();
        const locToSearch = searchLocation || location;
        // Xử lý địa điểm
        if (locToSearch) {
            params.append("location_text", searchLocation);
            const coords = await geocodeAddress(searchLocation);
            if (coords) {
                params.append("lat", coords.lat);
                params.append("lng", coords.lng);
                params.append("radius", 10);
            }
        }

        // Xử lý ngày
        if (startDate) params.append("checkin", formatDate(startDate));
        if (endDate) params.append("checkout", formatDate(endDate));
        
        params.append("guests", guests);
        
        // Chuyển trang
        navigate(`/search/?${params.toString()}`);

    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
    } finally {
        setIsSearching(false); 
    }
  };

  // --- 2. LẮNG NGHE TỰ ĐỘNG TỪ TRANG CHỦ ---
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation); // 1. Điền chữ vào ô
      executeSearch(initialLocation); // 2. TỰ ĐỘNG BẤM TÌM LUÔN
    }
  }, [initialLocation]);

  // --- 3. XỬ LÝ KHI NGƯỜI DÙNG BẤM NÚT THỦ CÔNG ---
  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(location); // Gọi hàm chung với địa điểm hiện tại trong ô input
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        
        {/* --- Ô 1: ĐIỂM ĐẾN --- */}
        <div className="md:col-span-4 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#BF1D2D] z-10">
             <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder="Bạn muốn đi đâu?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#BF1D2D] focus:border-[#BF1D2D] block pl-10 p-3 outline-none hover:bg-gray-100 transition truncate"
          />
        </div>

        {/* --- Ô 2: NGÀY --- */}
        <div className="md:col-span-4 relative group">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 group-focus-within:text-[#BF1D2D]">
             <Calendar size={20} />
          </div>
          <div className="w-full">
            <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="Nhận phòng - Trả phòng"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#BF1D2D] focus:border-[#BF1D2D] block pl-10 p-3 outline-none hover:bg-gray-100 transition cursor-pointer"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                wrapperClassName="w-full"
                onKeyDown={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {/* --- Ô 3: SỐ KHÁCH --- */}
        <div className="md:col-span-3 relative">
            <div className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2 px-3 hover:bg-gray-100 transition h-[46px]">
                <div className="flex items-center gap-2 text-gray-500">
                    <Users size={20} />
                    <span className="font-medium text-gray-700">{guests} khách</span>
                </div>
                
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

        {/* --- NÚT TÌM --- */}
        <div className="md:col-span-1 h-full">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full h-[46px] bg-[#BF1D2D] hover:bg-[#a01825] text-white font-medium rounded-lg text-sm flex items-center justify-center transition-all shadow-md hover:shadow-lg transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Search size={20} /> 
            )}
          </button>
        </div>

      </form>
    </div>
  );
}