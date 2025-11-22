import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import Components
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ResultBar from "../components/ResultBar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SearchingPage() {
  const [searchParamsURL] = useSearchParams();
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [results, setResults] = useState([]); // Dữ liệu gốc từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE BỘ LỌC (SIDEBAR) ---
  const PRICE_MIN_LIMIT = 0;
  const PRICE_MAX_LIMIT = 10000000; // 10 triệu

  const [filters, setFilters] = useState({
    priceMin: PRICE_MIN_LIMIT,
    priceMax: PRICE_MAX_LIMIT,
    types: {
      hotel: false,
      homestay: false,
      villa: false,
      apartment: false,
    },
    amenities: {
      wifi: false,
      pool: false,
      ac: false,
      parking: false,
    },
    minRating: null,
  });

  // --- HELPER FUNCTIONS ---
  const formatVnd = (value) => {
    if (value === null || value === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const parseTags = (tagString) => {
    if (!tagString) return [];
    return tagString.split(",").map((t) => t.trim()).filter(t => t !== "");
};
  // --- HANDLERS CHO BỘ LỌC ---
  const handleFilterChange = (field, rawValue) => {
    setFilters((prev) => {
      let value = Number(rawValue);
      if (Number.isNaN(value)) value = 0;

      let next = { ...prev, [field]: value };
      
      // Validate min/max
      if (field === "priceMin" && next.priceMin > next.priceMax) next.priceMax = next.priceMin;
      if (field === "priceMax" && next.priceMax < next.priceMin) next.priceMin = next.priceMax;
      
      return next;
    });
  };

  const handleTypeChange = (name) => {
    setFilters((prev) => ({
      ...prev,
      types: { ...prev.types, [name]: !prev.types[name] },
    }));
  };

  const handleAmenityChange = (name) => {
    setFilters((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: !prev.amenities[name] },
    }));
  };

  const handleRatingChange = (value) => {
    setFilters((prev) => ({ ...prev, minRating: value }));
  };

  const handleClearFilter = () => {
    setFilters({
      priceMin: PRICE_MIN_LIMIT,
      priceMax: PRICE_MAX_LIMIT,
      types: { hotel: false, homestay: false, villa: false, apartment: false },
      amenities: { wifi: false, pool: false, ac: false, parking: false },
      minRating: null,
    });
  };

  // --- LOGIC LỌC KẾT QUẢ (CLIENT-SIDE) ---
  const applyFilters = (items) => {
    return items.filter((item) => {
      // 1. Lọc theo Giá
      const price = parseFloat(item.price) || 0;
      if (price < filters.priceMin || price > filters.priceMax) return false;

      // 2. Lọc theo Loại chỗ ở (Property Type)
      // Kiểm tra xem có checkbox nào được tick không
      const activeTypes = Object.keys(filters.types).filter((key) => filters.types[key]);
      if (activeTypes.length > 0) {
        // Backend có thể trả về "Khách sạn", "Căn hộ"... hoặc "hotel", "apartment"
        // Cần chuẩn hóa để so sánh tương đối
        const itemTypeLower = (item.property_type || "").toLowerCase();
        
        // Logic mapping đơn giản: check xem type của item có chứa từ khóa đã tick không
        // Ví dụ: itemType="Luxury Hotel" sẽ khớp với filter="hotel"
        const isMatch = activeTypes.some(type => itemTypeLower.includes(type));
        if (!isMatch) return false;
      }

      // 3. Lọc theo Rating (Nếu backend có trả về rating)
      // Giả sử item.ratingScore có tồn tại. Nếu chưa có thì bỏ qua.
      if (filters.minRating !== null && item.ratingScore) {
        if (item.ratingScore < filters.minRating) return false;
      }

      return true;
    });
  };

  const filteredResults = applyFilters(results);

  // --- GỌI API ---
  useEffect(() => {
    const fetchAccommodations = async () => {
      setIsLoading(true);
      setError(null);
      setResults([]);

      const token = localStorage.getItem("access_token");
      
      // Lấy params từ URL
      const params = new URLSearchParams();
      const lat = searchParamsURL.get("lat");
      const lng = searchParamsURL.get("lng");
      const radius = searchParamsURL.get("radius");
      const locationText = searchParamsURL.get("location_text");

      if (lat && lng) {
        params.append("lat", lat);
        params.append("lng", lng);
        params.append("radius", radius || 10);
      } else if (locationText) {
        params.append("location_text", locationText);
      } else {
        // Nếu không có gì cả thì không gọi API hoặc gọi mặc định
        setIsLoading(false);
        return;
      }

      try {
        // Nếu user chưa login, API search vẫn nên hoạt động (tùy logic backend)
        // Nhưng code cũ của bạn yêu cầu token, nên ta giữ nguyên headers
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE_URL}/api/accommodations/search/?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers
            }
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }

        const data = await response.json();
        console.log("API Results:", data);
        setResults(data);

      } catch (err) {
        console.error("Search Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccommodations();
  }, [searchParamsURL]);


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="mx-auto w-[95%] md:w-[90%] max-w-7xl pt-6 pb-10">
        {/* Thanh tìm kiếm giữ nguyên vị trí */}
        <div className="mb-8">
          <SearchingBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR BỘ LỌC --- */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Bộ lọc</h2>
                <button onClick={handleClearFilter} className="text-sm text-blue-600 hover:underline">
                    Đặt lại
                </button>
              </div>

              {/* Filter: Giá */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Khoảng giá</label>
                <div className="text-xs text-[#BF1D2D] font-bold mb-3 text-right">
                   {formatVnd(filters.priceMin)} - {formatVnd(filters.priceMax)}
                </div>
                <input
                  type="range"
                  min={PRICE_MIN_LIMIT}
                  max={PRICE_MAX_LIMIT}
                  step={500000}
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#BF1D2D]"
                />
              </div>

              {/* Filter: Loại chỗ ở */}
              <div className="mb-6 border-t pt-4">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Loại chỗ ở</label>
                <div className="space-y-2">
                    {['hotel', 'homestay', 'villa', 'apartment'].map(type => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={filters.types[type]}
                                onChange={() => handleTypeChange(type)}
                                className="rounded text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                            />
                            <span className="text-sm text-gray-600 capitalize">
                                {type === 'apartment' ? 'Căn hộ' : type}
                            </span>
                        </label>
                    ))}
                </div>
              </div>

              {/* Filter: Rating */}
              <div className="mb-6 border-t pt-4">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Đánh giá</label>
                <div className="space-y-2">
                    {[9, 8, 7].map(score => (
                        <label key={score} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="rating"
                                checked={filters.minRating === score}
                                onChange={() => handleRatingChange(score)}
                                className="text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                            />
                            <span className="text-sm text-gray-600">Từ {score}.0 trở lên</span>
                        </label>
                    ))}
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="rating"
                            checked={filters.minRating === null}
                            onChange={() => handleRatingChange(null)}
                            className="text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                        />
                        <span className="text-sm text-gray-600">Mọi đánh giá</span>
                    </label>
                </div>
              </div>
            </div>
          </aside>

          {/* --- DANH SÁCH KẾT QUẢ --- */}
          <section className="lg:col-span-9">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    Kết quả tìm kiếm
                </h3>
                <span className="text-sm text-gray-500">
                    Tìm thấy {filteredResults.length} chỗ ở
                </span>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF1D2D]"></div>
                    <p className="mt-4 text-gray-500">Đang tìm chỗ ở tốt nhất cho bạn...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Đã xảy ra lỗi! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredResults.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <div className="text-4xl mb-4">😕</div>
                    <h3 className="text-lg font-medium text-gray-900">Không tìm thấy chỗ ở nào</h3>
                    <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc, mở rộng khu vực hoặc chọn ngày khác.</p>
                    <button onClick={handleClearFilter} className="mt-4 text-[#BF1D2D] font-semibold hover:underline">
                        Xóa bộ lọc tìm kiếm
                    </button>
                </div>
            )}

            {/* Results List */}
            <div className="space-y-6">
                {!isLoading && filteredResults.map((item) => {
                    // --- XỬ LÝ ẢNH: Lấy ảnh đầu tiên trong chuỗi ---
                    let displayImage = "https://placehold.co/600x400?text=No+Image";
                    if (item.picture_url) {
                         // Tách chuỗi url1,url2 thành mảng và lấy phần tử đầu
                         const urls = item.picture_url.split(',');
                         if (urls.length > 0 && urls[0].trim() !== "") {
                             displayImage = urls[0].trim();
                         }
                    }

                    return (
                        <ResultBar
                            key={item.accommodation_id || item.id}
                            image={displayImage} // Đã xử lý
                            title={item.title}
                            location={item.location}
                            
                            // Mock dữ liệu rating vì API chưa có
                            ratingText="Tuyệt vời"
                            ratingScore={9.5}
                            ratingCount={120}
                            stars={4}
                            
                            tags={parseTags(item.tags || item.ai_tags || "")} // Hỗ trợ cả 2 tên trường tags
                            categories={[item.property_type]}
                            summary={`${item.max_guests} khách tối đa`}
                            
                            priceLabel={formatVnd(item.price)}
                            priceNote="chưa bao gồm thuế"
                            
                            // SỰ KIỆN CLICK: Chuyển trang
                            onClick={() => navigate(`/accommodations/${item.accommodation_id || item.id}`)}
                        />
                    );
                })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}