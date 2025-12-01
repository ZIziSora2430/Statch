import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

// Import Components
import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ResultBar from "../components/ResultBar";
import { Filter, X, Frown } from "lucide-react"; // Thêm icon cho sinh động (cần cài lucide-react)

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SearchingPage() {
  const [searchParamsURL] = useSearchParams();
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [results, setResults] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE BỘ LỌC ---
  const PRICE_MIN_LIMIT = 0;
  const PRICE_MAX_LIMIT = 10000000;

  const [filters, setFilters] = useState({
    priceMin: PRICE_MIN_LIMIT,
    priceMax: PRICE_MAX_LIMIT,
    types: { hotel: false, homestay: false, villa: false, apartment: false },
    amenities: { wifi: false, pool: false, ac: false, parking: false },
    minRating: null,
  });

  // --- HELPER FUNCTIONS (Giữ nguyên) ---
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

  // --- HELPER: Chuyển điểm số thành chữ ---
  const getRatingText = (score) => {
    if (!score) return "Mới"; // Chưa có đánh giá
    
    if (score >= 9.5) return "Xuất sắc";
    if (score >= 9.0) return "Tuyệt hảo";
    if (score >= 8.0) return "Tuyệt vời";
    if (score >= 7.0) return "Rất tốt";
    if (score >= 6.0) return "Tốt";
    if (score >= 5.0) return "Trung bình";
    return "Điểm thấp";
  };

  // --- Bộ lọc ---
  const handleFilterChange = (field, rawValue) => {
    setFilters((prev) => {
      let value = Number(rawValue);
      if (Number.isNaN(value)) value = 0;
      let next = { ...prev, [field]: value };
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

  // --- LOGIC LỌC (Giữ nguyên) ---
  const applyFilters = (items) => {
    return items.filter((item) => {
      const price = parseFloat(item.price) || 0;
      if (price < filters.priceMin || price > filters.priceMax) return false;

      const activeTypes = Object.keys(filters.types).filter((key) => filters.types[key]);
      if (activeTypes.length > 0) {
        const itemTypeLower = (item.property_type || "").toLowerCase();
        const isMatch = activeTypes.some(type => itemTypeLower.includes(type));
        if (!isMatch) return false;
      }

      if (filters.minRating !== null) {
        const score = item.rating_score || 0; 
        if (score < filters.minRating) return false;
      }
      return true;
    });
  };

  const filteredResults = applyFilters(results);

  useEffect(() => {
    const fetchAccommodations = async () => {
      setIsLoading(true);
      setError(null);
      setResults([]);

      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      const lat = searchParamsURL.get("lat");
      const lng = searchParamsURL.get("lng");
      const radius = searchParamsURL.get("radius");
      const locationText = searchParamsURL.get("location_text");
      const checkin = searchParamsURL.get("checkin");
      const checkout = searchParamsURL.get("checkout");
      const guests = searchParamsURL.get("guests");

      if (lat && lng) {
        params.append("lat", lat);
        params.append("lng", lng);
        params.append("radius", radius || 10);
      }
      if (locationText) {
        params.append("location_text", locationText);
      } else {
        setIsLoading(false);
        return;
      }
      if (checkin) params.append("checkin", checkin);
      if (checkout) params.append("checkout", checkout);
      if (guests) params.append("guests", guests);
      
      try {
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/api/accommodations/search/?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", ...headers }
        });

        if (!response.ok) throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        const data = await response.json();
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


  // --- RENDER GIAO DIỆN MỚI ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. HEADER KẾT HỢP (STICKY) --- */}
      {/* Gom Navbar và SearchBar vào chung 1 khối dính ở trên cùng */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar />
        
        {/* Thanh Search nằm ngay dưới Navbar, có viền ngăn cách nhẹ */}
        <div className="border-t border-gray-100 pt-18 pb-4 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchingBar />
            </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 mt-4 pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- 2. SIDEBAR BỘ LỌC --- */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-40 max-h-[calc(100vh-180px)] overflow-y-auto">
              
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={20} /> Bộ lọc
                </h2>
                <button onClick={handleClearFilter} className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition">
                    Đặt lại
                </button>
              </div>

              {/* Filter: Giá */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Khoảng giá</label>
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                   <span>{formatVnd(filters.priceMin)}</span>
                   <span>{formatVnd(filters.priceMax)}</span>
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
              <div className="mb-6 border-t border-gray-100 pt-4">
                <label className="text-sm font-bold text-gray-700 mb-3 block">Loại chỗ ở</label>
                <div className="space-y-2.5">
                    {['hotel', 'homestay', 'villa', 'apartment'].map(type => (
                        <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={filters.types[type]}
                                    onChange={() => handleTypeChange(type)}
                                    className="peer h-4 w-4 rounded border-gray-300 text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                                />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-[#BF1D2D] transition capitalize">
                                {type === 'apartment' ? 'Căn hộ' : type}
                            </span>
                        </label>
                    ))}
                </div>
              </div>

              {/* Filter: Rating */}
              <div className="mb-2 border-t border-gray-100 pt-4">
                <label className="text-sm font-bold text-gray-700 mb-3 block">Đánh giá khách hàng</label>
                <div className="space-y-2.5">
                    {[9, 8, 7].map(score => (
                        <label key={score} className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="rating"
                                checked={filters.minRating === score}
                                onChange={() => handleRatingChange(score)}
                                className="h-4 w-4 border-gray-300 text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                            />
                            <span className="text-sm text-gray-600 group-hover:text-[#BF1D2D] transition">Từ {score}.0 trở lên</span>
                        </label>
                    ))}
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="radio" 
                            name="rating"
                            checked={filters.minRating === null}
                            onChange={() => handleRatingChange(null)}
                            className="h-4 w-4 border-gray-300 text-[#BF1D2D] focus:ring-[#BF1D2D]" 
                        />
                        <span className="text-sm text-gray-600 group-hover:text-[#BF1D2D] transition">Mọi đánh giá</span>
                    </label>
                </div>
              </div>
            </div>
          </aside>

          {/* --- 3. DANH SÁCH KẾT QUẢ --- */}
          <section className="lg:col-span-9">
            
            {/* Header Kết quả */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        Kết quả tìm kiếm
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Hiển thị {filteredResults.length} chỗ ở phù hợp nhất
                    </p>
                </div>
                {/* Có thể thêm Dropdown Sắp xếp ở đây */}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#BF1D2D] border-t-transparent"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tìm chỗ ở tốt nhất cho bạn...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
                    <X size={24} />
                    <div>
                        <strong className="font-bold block">Đã xảy ra lỗi!</strong>
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Empty State - Thiết kế lại đẹp hơn */}
            {!isLoading && !error && filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Frown size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả nào</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Chúng tôi không tìm thấy chỗ ở nào phù hợp với bộ lọc của bạn. Hãy thử mở rộng khu vực hoặc điều chỉnh mức giá.
                    </p>
                    <button 
                        onClick={handleClearFilter} 
                        className="px-6 py-2.5 bg-[#BF1D2D] text-white text-sm font-bold rounded-lg hover:bg-[#a01825] transition shadow-lg shadow-red-200"
                    >
                        Xóa toàn bộ lọc
                    </button>
                </div>
            )}

            {/* Results List */}
            <div className="space-y-6">
                {!isLoading && filteredResults.map((item) => {
                    let displayImage = "https://placehold.co/600x400?text=No+Image";
                    if (item.picture_url) {
                         const urls = item.picture_url.split(',');
                         if (urls.length > 0 && urls[0].trim() !== "") {
                             displayImage = urls[0].trim();
                         }
                    }

                    return (
                        <ResultBar
                            key={item.accommodation_id || item.id}
                            image={displayImage}
                            title={item.title}
                            location={item.location}
                            
                            ratingText={getRatingText(item.rating_score)}
                            ratingScore={item.rating_score || 0.0} // Fallback nếu API chưa có
                            ratingCount={item.review_count}
                            stars={4}
                            
                            tags={parseTags(item.tags || item.ai_tags || "")}
                            categories={[item.property_type]}
                            summary={`${item.max_guests} khách tối đa`}
                            
                            priceLabel={formatVnd(item.price)}
                            priceNote="chưa bao gồm thuế"
                            
                            onClick={() => navigate(`/accommodations/${item.accommodation_id || item.id}`)}
                        />
                    );
                })}
            </div>
          </section>
        </div>
      </main>
      <Footer/>
    </div>
  );
}