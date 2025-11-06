import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ResultBar from "../components/ResultBar"; 
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

export default function SearchingPage() {

  const [searchParamsURL] = useSearchParams();

  
  // State UI trạng thái
  const [results, setResults] = useState([]); // Kết quả tìm kiếm thực tế
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Thông báo lỗi

    // 2. STATE để lưu trữ tham số tìm kiếm
  const [searchParams, setSearchParams] = useState({
    lat: null, 
    lng: null, 
    radius: 10,
    location_text: searchParamsURL.get('location_text') || "Thành phố Hồ Chí Minh", 
  });

    
    const toScore10 = (r) => Math.round(r * 20) / 10;

  //  const fetchAccommodations = async (currentParams) => {
  //   setIsLoading(true);
  //   setError(null);
  //   setResults([]); 
    
  //   // ⚠️ LẤY ACCESS TOKEN ĐÃ LƯU TỪ SIGNINPAGE
  //   const accessToken = localStorage.getItem("access_token");
    
  //   if (!accessToken) {
  //       setError("Vui lòng đăng nhập để xem kết quả tìm kiếm. Token không tìm thấy.");
  //       setIsLoading(false);
  //       return; 
  //   }

  //   // Xây dựng chuỗi query params (chỉ dùng các tham số được backend xử lý)
  //   const params = new URLSearchParams();
    
  //   // Ưu tiên tìm kiếm theo tọa độ nếu có
  //   if (currentParams.lat !== null && currentParams.lng !== null) {
  //     params.append("lat", currentParams.lat);
  //     params.append("lng", currentParams.lng);
  //     params.append("radius", currentParams.radius);
      
  //   // Nếu không có tọa độ, dùng location_text
  //   } else if (searchParams.location_text) {
  //     params.append("location_text", searchParams.location_text);
  //   }
    
  //   // Nếu không có tham số nào, không gọi API
  //   if (params.toString() === "") {
  //        setIsLoading(false);
  //        return; 
  //   }
    
  //   const url = `${API_BASE_URL}/api/accommodations/search/?${params.toString()}`;

  //   try {
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // ⚠️ GỬI TOKEN CÙNG REQUEST
  //         'Authorization': `Bearer ${accessToken}`, 
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       if (response.status === 401) {
  //            throw new Error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
  //       }
  //       throw new Error(errorData.detail || `Lỗi HTTP: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setResults(data);

  //   } catch (err) {
  //     console.error("Lỗi khi tìm kiếm chỗ ở:", err);
  //     setError(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 5. Sử dụng useEffect để gọi API khi component được mount và khi searchParams thay đổi
  useEffect(() => {

    const newLocationText = searchParamsURL.get('location_text') || "";
    const currentLat = searchParamsURL.get('lat');
    const currentLng = searchParamsURL.get('lng');
    const currentRadius = searchParamsURL.get('radius');

    
    const newParams = {
        location_text: newLocationText,
        lat: currentLat ? parseFloat(currentLat) : null,
        lng: currentLng ? parseFloat(currentLng) : null,
        radius: currentRadius ? parseInt(currentRadius) : 10,
    };

    const fetchAccommodations = async (paramsToFetch) => { // Dùng paramsToFetch thay cho currentParams
    setIsLoading(true);
    setError(null);
    setResults([])

    // ⚠️ LẤY ACCESS TOKEN ĐÃ LƯU TỪ SIGNINPAGE
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        setError("Vui lòng đăng nhập để xem kết quả tìm kiếm. Token không tìm thấy.");
        setIsLoading(false);
        return; 
    }
    // Xây dựng chuỗi query params (chỉ dùng các tham số được backend xử lý)
    const newSearchParams = new URLSearchParams();
    // Ưu tiên tìm kiếm theo tọa độ nếu có
    if (paramsToFetch.lat !== null && paramsToFetch.lng !== null) {
      newSearchParams.append("lat", paramsToFetch.lat);
      newSearchParams.append("lng", paramsToFetch.lng);
      newSearchParams.append("radius", paramsToFetch.radius);

    // Nếu không có tọa độ, dùng location_text
    } else if (paramsToFetch.location_text) {
      newSearchParams.append("location_text", paramsToFetch.location_text);
    }

    // Nếu không có tham số nào, không gọi API
    if (newSearchParams.toString() === "") {
         setIsLoading(false);
         return; 
    }

    const url = `${API_BASE_URL}/api/accommodations/search/?${newSearchParams.toString()}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ GỬI TOKEN CÙNG REQUEST
          'Authorization': `Bearer ${accessToken}`, 
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
      setResults(data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm chỗ ở:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

  }
    setSearchParams(newParams); // Cập nhật state searchParams với giá trị mới

    if (newLocationText || currentLat) { 
        // ⚠️ Gọi hàm fetch bên trong useEffect để đảm bảo nó luôn dùng giá trị mới nhất
        fetchAccommodations(newParams);
    } else {
        // Nếu URL không có tham số nào, chỉ tắt loading
        setIsLoading(false);
    }
    
  }, [searchParamsURL]);



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-6 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <SearchingBar/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Sidebar filter chỉ là khung */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">Bộ lọc (khung)</h2>
                <p className="text-sm text-gray-500 mt-1">Khu vực này chỉ là khung giao diện; logic lọc sẽ làm sau.</p>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700">Điểm đến</div>
                  <div className="mt-2 h-10 rounded-xl border border-gray-200 bg-gray-50" />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700">Khoảng giá</div>
                  <div className="mt-2 h-10 rounded-xl border border-gray-200 bg-gray-50" />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700">Ngày ở</div>
                  <div className="mt-2 h-10 rounded-xl border border-gray-200 bg-gray-50" />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-sm font-medium text-gray-700">Tiện nghi</div>
                  <div className="mt-2 space-y-2">
                    <div className="h-9 rounded-xl border border-gray-200 bg-gray-50" />
                    <div className="h-9 rounded-xl border border-gray-200 bg-gray-50" />
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl bg-[#BF1D2D] text-white font-medium py-2.5 hover:bg-[#a41725] active:scale-[.99] transition"
                >
                  Áp dụng (demo)
                </button>
              </div>
            </div>
          </aside>

          {/* Kết quả */}
          <section className="md:col-span-8 lg:col-span-9">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Kết quả đề xuất</h3>
              <div className="text-sm text-gray-500">{results.length} chỗ ở</div>
            </div>

            {/* THAY = ResultBar */}
            <div className="mt-4 space-y-5">
              {results.map((item) => (
                <ResultBar
                  key={item.accommodation_id || item.id}
                  // map dữ liệu sang props mà ResultBar của bạn mong đợi:
                  image={item.thumb || "https://placehold.co/1200x800"} // ảnh demo nếu không có ảnh
                  title={item.title}
                  location={item.location}
                  // ⚠️ Dùng giá trị mặc định cho các trường demo không có trong API
                  ratingText={"Rất tốt"} 
                  ratingCount={0}
                  ratingScore={9.0} 
                  stars={4}
                  
                  tags={["Chưa phân loại"]} 
                  categories={["Khách sạn"]} 
                  dateRangeLabel="T5, 20 tháng 11 - T6, 21 tháng 11"
                  summary="1 đêm, 2 người lớn"
                  priceLabel={item.price || "Liên hệ"}
                  priceNote="Đã bao gồm thuế và phí"
                  onClick={() => console.log("Xem chi tiết:", item.accommodation_id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
         <footer className="bg-gray-900 text-gray-300 py-6 mt-10 text-center">
  <div className="container mx-auto">
    <p className="text-sm">
      © 2025 Statch. All rights reserved.
    </p>
    <div className="mt-2 flex justify-center gap-4">
      <a href="#" className="hover:text-white transition">Về chúng tôi</a>
      <a href="#" className="hover:text-white transition">Liên hệ</a>
      <a href="#" className="hover:text-white transition">Điều khoản</a>
    </div>
  </div>
</footer>
    </div>
    
  );
}
