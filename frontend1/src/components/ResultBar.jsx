// components/ResultBar.jsx
import React from "react";

function Chip({ children, className = "" }) {
  if (!children) return null;
  return (
    <span className={"inline-flex items-center rounded-full px-3 py-1 text-sm font-medium " + className}>
      {children}
    </span>
  );
}

export default function ResultBar({
  image,
  title = "Chỗ ở chưa đặt tên",
  ratingText = "Mới",
  ratingCount = 0,
  ratingScore = 0,
  stars = 0, 
  tags = [], // Mảng các tag phụ (VD: view biển, hồ bơi)
  categories = [], // Mảng loại phòng (VD: Villa, Khách sạn)
  dateRangeLabel = "Chọn ngày để kiểm tra",
  summary = "Tối đa 2 khách",
  priceLabel = "Liên hệ",
  priceNote = "Đã bao gồm thuế và phí",
  onClick = () => {},
}) {
  return (
    <article 
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Left: Image */}
        <div className="md:col-span-2 h-56 md:h-auto relative">
          <img
            src={image || "https://placehold.co/600x400?text=No+Image"}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {e.target.src = "https://placehold.co/600x400?text=Error";}} // Fallback nếu ảnh lỗi
          />
        </div>

        {/* Right: Content */}
        <div className="md:col-span-3 p-4 sm:p-6 flex flex-col gap-3 justify-between">
          {/* Top row: Title + rating */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight line-clamp-2">
                  {title}
                </h3>
                {/* Stars */}
                {stars > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating badge */}
              <div className="text-right min-w-20">
                <div className="text-base font-semibold text-gray-800">{ratingText}</div>
                <div className="text-xs text-gray-500">{ratingCount} đánh giá</div>
                {ratingScore > 0 && (
                  <div className="mt-1 inline-flex items-center justify-center rounded-md bg-red-600 px-2 py-1 text-white text-sm font-bold">
                    {ratingScore.toString().replace(".", ",")}
                  </div>
                )}
              </div>
            </div>

            {/* Chips: Categories (Loại phòng) */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {categories.map((c, idx) => (
                 // Chỉ render nếu c có dữ liệu
                 c ? (
                  <Chip key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 uppercase text-[10px] tracking-wide">
                    {c}
                  </Chip>
                 ) : null
              ))}
            </div>
            
            {/* Chips: Tags (Vị trí, tiện ích) */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {tags.map((t, idx) => (
                 t ? (
                  <Chip key={idx} className="bg-gray-100 text-gray-600 border border-gray-200">
                    {t}
                  </Chip>
                 ) : null
              ))}
            </div>
          </div>

          {/* Bottom Row: Info & Price */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700">
                {dateRangeLabel}
              </div>
              <div className="text-sm text-gray-500 font-medium">{summary}</div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3 border-gray-100">
              <div>
                <div className="text-xl font-extrabold text-[#BF1D2D]">
                  {priceLabel}
                </div>
                <div className="text-xs text-gray-400">{priceNote}</div>
              </div>
              <button className="inline-flex items-center justify-center rounded-lg bg-[#BF1D2D] px-4 py-2 text-white text-sm font-semibold hover:bg-[#a01826] active:scale-95 transition shadow-md">
                Xem chỗ trống →
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}