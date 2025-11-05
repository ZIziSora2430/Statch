import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ResultBar from "../components/ResultBar"; 
import { useState } from "react";

export default function SearchingPage() {
  const [results] = useState([
    { id: 1, title: "Cozy Studio near Old Quarter", location: "Hà Nội, Việt Nam", price: "VND 850.000", thumb: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d83?q=80&w=1200&auto=format&fit=crop", rating: 4.7, reviews: 126 },
    { id: 2, title: "Beachfront Apartment with View", location: "Đà Nẵng, Việt Nam", price: "VND 1.300.000", thumb: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d83?q=80&w=1200&auto=format&fit=crop", rating: 4.9, reviews: 210 },
    { id: 3, title: "Minimalist Homestay in Saigon", location: "TP.HCM, Việt Nam", price: "VND 990.000", thumb: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop", rating: 4.6, reviews: 89 },
  ]);

  // Nếu ResultBar cần thang điểm 10 (ví dụ 9,2)
  const toScore10 = (r) => Math.round(r * 20) / 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-6 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <SearchingBar />
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
                  key={item.id}
                  // map dữ liệu sang props mà ResultBar của bạn mong đợi:
                  image={item.thumb}
                  title={item.title}
                  location={item.location}
                  ratingText={item.rating >= 4.8 ? "Tuyệt hảo" : "Rất tốt"}
                  ratingCount={item.reviews}
                  ratingScore={toScore10(item.rating)}     // ví dụ 9.2
                  stars={Math.floor(item.rating)}           // nếu ResultBar hiển thị sao
                  tags={["Côn Đảo", "View biển", "Xe đưa đón", "Hồ bơi"]} // demo
                  categories={["3 sao", "Chỗ đậu xe", "Thú cưng", "Khách sạn"]} // demo
                  dateRangeLabel="T5, 20 tháng 11 - T6, 21 tháng 11"
                  summary="1 đêm, 2 người lớn"
                  priceLabel={item.price}
                  priceNote="Đã bao gồm thuế và phí"
                  onClick={() => console.log("Xem chỗ trống:", item.id)}
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
