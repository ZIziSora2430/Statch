import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ResultBar from "../components/ResultBar";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

export default function SearchingPage() {
  const [searchParamsURL] = useSearchParams();
  const navigate = useNavigate(); 

  // State UI trạng thái
  const [results, setResults] = useState([]); // Kết quả tìm kiếm thực tế
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Thông báo lỗi

  // State tham số tìm kiếm (giữ nguyên logic cũ)
  const [searchParams, setSearchParams] = useState({
    lat: null,
    lng: null,
    radius: 10,
    location_text: searchParamsURL.get("location_text") || "Thành phố Hồ Chí Minh",
  });

  const toScore10 = (r) => Math.round(r * 20) / 10;

  // ⭐ Bộ lọc sidebar
  const PRICE_MIN_LIMIT = 0;
  const PRICE_MAX_LIMIT = 10000000; // 10 triệu

  const [filters, setFilters] = useState({
    priceMin: PRICE_MIN_LIMIT,
    priceMax: PRICE_MAX_LIMIT,

    // Tiện nghi
    amenities: {
      wifi: false,
      pool: false,
      ac: false,
      parking: false,
    },

    // Loại chỗ ở
    types: {
      hotel: false,
      homestay: false,
      villa: false,
      apartment: false,
    },

    // Đánh giá khách hàng (min rating) – null = tất cả
    minRating: null,
  });

  const handleFilterChange = (field, rawValue) => {
    setFilters((prev) => {
      let value = Number(rawValue);
      if (Number.isNaN(value)) value = 0;

      let next = { ...prev, [field]: value };

      // Đảm bảo không vượt giới hạn
      next.priceMin = Math.max(PRICE_MIN_LIMIT, Math.min(next.priceMin, PRICE_MAX_LIMIT));
      next.priceMax = Math.max(PRICE_MIN_LIMIT, Math.min(next.priceMax, PRICE_MAX_LIMIT));

      // Đảm bảo min <= max
      if (field === "priceMin" && next.priceMin > next.priceMax) {
        next.priceMax = next.priceMin;
      }
      if (field === "priceMax" && next.priceMax < next.priceMin) {
        next.priceMin = next.priceMax;
      }

      return next;
    });
  };

  // Tick/untick tiện nghi
  const handleAmenityChange = (name) => {
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: !prev.amenities[name],
      },
    }));
  };

  // Tick/untick loại chỗ ở
  const handleTypeChange = (name) => {
    setFilters((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [name]: !prev.types[name],
      },
    }));
  };

  // Chọn mức đánh giá tối thiểu
  const handleRatingChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      minRating: value,
    }));
  };

  const handleClearFilter = () => {
    setFilters({
      priceMin: PRICE_MIN_LIMIT,
      priceMax: PRICE_MAX_LIMIT,
      amenities: {
        wifi: false,
        pool: false,
        ac: false,
        parking: false,
      },
      types: {
        hotel: false,
        homestay: false,
        villa: false,
        apartment: false,
      },
      minRating: null,
    });
  };

  const formatVnd = (value) => {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  // Helper: parse giá về số
  const parsePriceToNumber = (price) => {
    if (price === null || price === undefined) return null;
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  // Hàm helper để chuyển chuỗi "A, B, C" thành mảng ["A", "B", "C"]
  const parseTags = (tagString) => {
    if (!tagString) return [];
    return tagString.split(",").map(t => t.trim());
  };

  // Áp dụng filter lên results (client-side) – HIỆN TẠI chỉ lọc theo giá
  const applyFilters = (items) => {
    return items.filter((item) => {
      const priceNumber = parsePriceToNumber(item.price);
      if (priceNumber === null) return true; // nếu không có giá thì khỏi lọc

      if (priceNumber < filters.priceMin) return false;
      if (priceNumber > filters.priceMax) return false;

      // ⭐ tiện nghi / loại chỗ ở / rating chưa dùng để lọc
      return true;
    });
  };

  const filteredResults = applyFilters(results);

  // useEffect gọi API (giữ nguyên logic cũ)
  useEffect(() => {
    const newLocationText = searchParamsURL.get("location_text") || "";
    const currentLat = searchParamsURL.get("lat");
    const currentLng = searchParamsURL.get("lng");
    const currentRadius = searchParamsURL.get("radius");

    const newParams = {
      location_text: newLocationText,
      lat: currentLat ? parseFloat(currentLat) : null,
      lng: currentLng ? parseFloat(currentLng) : null,
      radius: currentRadius ? parseInt(currentRadius) : 10,
    };

    const fetchAccommodations = async (paramsToFetch) => {
      setIsLoading(true);
      setError(null);
      setResults([]);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setError("Vui lòng đăng nhập để xem kết quả tìm kiếm. Token không tìm thấy.");
        setIsLoading(false);
        return;
      }

      const newSearchParams = new URLSearchParams();

      if (paramsToFetch.lat !== null && paramsToFetch.lng !== null) {
        newSearchParams.append("lat", paramsToFetch.lat);
        newSearchParams.append("lng", paramsToFetch.lng);
        newSearchParams.append("radius", paramsToFetch.radius);
      } else if (paramsToFetch.location_text) {
        newSearchParams.append("location_text", paramsToFetch.location_text);
      }

      if (newSearchParams.toString() === "") {
        setIsLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/accommodations/search/?${newSearchParams.toString()}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
          }
          throw new Error(errorData.detail || `Lỗi HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dữ liệu API trả về:", data); // <--- KIỂM TRA Ở CONSOLE (F12)
        setResults(data);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm chỗ ở:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    setSearchParams(newParams);

    if (newLocationText || currentLat) {
      fetchAccommodations(newParams);
    } else {
      setIsLoading(false);
    }
  }, [searchParamsURL]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-6 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <SearchingBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Sidebar filter */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn khoảng giá, loại chỗ ở và tiện nghi phù hợp với bạn.
                </p>

                {/* KHOẢNG GIÁ */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Khoảng giá (VND)
                    </span>
                    <span className="text-[11px] font-semibold text-[#BF1D2D] text-right">
                      {formatVnd(filters.priceMin)}{" "}
                      <span className="text-gray-400">–</span>{" "}
                      {formatVnd(filters.priceMax)}
                    </span>
                  </div>

                  {/* Slider min–max trên 1 track */}
                  <div className="mt-4">
                    <div className="range-slider h-3  ">
                      <div className="range-slider__track" />

                      {/* thumb min */}
                      <input
                        type="range"
                        min={PRICE_MIN_LIMIT}
                        max={PRICE_MAX_LIMIT}
                        step={500000}
                        value={filters.priceMin}
                        onChange={(e) =>
                          handleFilterChange("priceMin", e.target.value)
                        }
                        className="range-slider__range range-thumb-circle"
                      />

                      {/* thumb max */}
                      <input
                        type="range"
                        min={PRICE_MIN_LIMIT}
                        max={PRICE_MAX_LIMIT}
                        step={500000}
                        value={filters.priceMax}
                        onChange={(e) =>
                          handleFilterChange("priceMax", e.target.value)
                        }
                        className="range-slider__range range-thumb-circle"
                      />
                    </div>

                    {/* Text min/max – bên dưới slider */}
                    <div className="mt-2 flex justify-between text-[11px] text-gray-400">
                      <span>{formatVnd(PRICE_MIN_LIMIT)}</span>
                      <span>{formatVnd(PRICE_MAX_LIMIT)}</span>
                    </div>
                  </div>
                </div>

                {/* LOẠI CHỖ Ở */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Loại chỗ ở
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.hotel}
                        onChange={() => handleTypeChange("hotel")}
                        className="w-4 h-4 rounded"
                      />
                      Khách sạn
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.homestay}
                        onChange={() => handleTypeChange("homestay")}
                        className="w-4 h-4 rounded"
                      />
                      Homestay
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.villa}
                        onChange={() => handleTypeChange("villa")}
                        className="w-4 h-4 rounded"
                      />
                      Villa
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.apartment}
                        onChange={() => handleTypeChange("apartment")}
                        className="w-4 h-4 rounded"
                      />
                      Căn hộ
                    </label>
                  </div>
                </div>

                {/* ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của khách hàng
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={filters.minRating === null}
                        onChange={() => handleRatingChange(null)}
                        className="w-4 h-4"
                      />
                      Tất cả
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={filters.minRating === 9}
                        onChange={() => handleRatingChange(9)}
                        className="w-4 h-4"
                      />
                      Từ 9.0 trở lên (Tuyệt vời)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={filters.minRating === 8}
                        onChange={() => handleRatingChange(8)}
                        className="w-4 h-4"
                      />
                      Từ 8.0 trở lên (Rất tốt)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={filters.minRating === 7}
                        onChange={() => handleRatingChange(7)}
                        className="w-4 h-4"
                      />
                      Từ 7.0 trở lên (Tốt)
                    </label>
                  </div>
                </div>

                {/* TIỆN NGHI */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Tiện nghi
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.wifi}
                        onChange={() => handleAmenityChange("wifi")}
                        className="w-4 h-4 rounded"
                      />
                      Wifi miễn phí
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.pool}
                        onChange={() => handleAmenityChange("pool")}
                        className="w-4 h-4 rounded"
                      />
                      Hồ bơi
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.ac}
                        onChange={() => handleAmenityChange("ac")}
                        className="w-4 h-4 rounded"
                      />
                      Máy lạnh
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.parking}
                        onChange={() => handleAmenityChange("parking")}
                        className="w-4 h-4 rounded"
                      />
                      Chỗ đậu xe
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="mt-5 w-full rounded-xl border border-gray-300 text-gray-700 font-medium py-2.5 hover:bg-gray-50 active:scale-[.99] transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </aside>

          {/* Kết quả */}
          <section className="md:col-span-8 lg:col-span-9">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Kết quả đề xuất</h3>
              <div className="text-sm text-gray-500">
                {filteredResults.length} chỗ ở (từ {results.length} kết quả)
              </div>
            </div>

            {isLoading && (
              <div className="mt-4 text-sm text-gray-500">Đang tải kết quả...</div>
            )}
            {error && !isLoading && (
              <div className="mt-4 text-sm text-red-500">Lỗi: {error}</div>
            )}

            <div className="mt-4 space-y-5">
              {!isLoading &&
                !error &&
                filteredResults.map((item) => (
                  <ResultBar
                    key={item.accommodation_id || item.id}
                    image={item.picture_url || "https://placehold.co/1200x800"}
                    title={item.title}
                    location={item.location}
                    ratingText={"Rất tốt"}
                    ratingCount={0}
                    ratingScore={9.0}
                    stars={4}
                    tags={parseTags(item.tags)}
                    categories={item.property_type ? [item.property_type] : []}
                    summary={(item.max_guests)}
                    priceLabel={formatVnd(item.price)}
                    priceNote="Đã bao gồm thuế và phí"
                    onClick={() =>
                      console.log("Xem chi tiết:", item.accommodation_id || item.id)
                    }
                  />
                ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6 mt-10 text-center">
        <div className="container mx-auto">
          <p className="text-sm">© 2025 Statch. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" className="hover:text-white transition">
              Về chúng tôi
            </a>
            <a href="#" className="hover:text-white transition">
              Liên hệ
            </a>
            <a href="#" className="hover:text-white transition">
              Điều khoản
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
