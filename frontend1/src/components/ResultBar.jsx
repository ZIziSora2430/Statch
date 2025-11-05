// components/ResultCard.jsx
import React from "react";

function Chip({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium " +
        className
      }
    >
      {children}
    </span>
  );
}

export default function ResultCard({
  image =
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop",
  title = "The Mystery Con Dao",
  ratingText = "Tuyệt hảo",
  ratingCount = 36,
  ratingScore = 9.2,
  stars = 3, // số sao
  tags = ["Côn Đảo", "View biển", "Xe đưa đón", "Hồ bơi"],
  categories = ["3 sao", "Chỗ đậu xe", "Thú cưng", "Khách sạn"],
  dateRangeLabel = "T5, 20 tháng 11 - T6, 21 tháng 11",
  summary = "1 đêm, 2 người lớn",
  priceLabel = "VND 980.000",
  priceNote = "Đã bao gồm thuế và phí",
  onClick = () => {},
}) {
  return (
    <article className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Left: Image */}
        <div className="md:col-span-2">
          <div className="relative h-56 md:h-full">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
            {/* bo tròn góc ảnh khớp container */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-r-none md:rounded-l-2xl ring-1 ring-transparent" />
          </div>
        </div>

        {/* Right: Content */}
        <div className="md:col-span-3 p-4 sm:p-6 flex flex-col gap-3">
          {/* Top row: Title + rating */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {title}
              </h3>
              {/* Stars */}
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-yellow-400"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Rating badge */}
            <div className="text-right">
              <div className="text-base font-semibold text-gray-800">
                {ratingText}
              </div>
              <div className="text-sm text-gray-500">{ratingCount} đánh giá</div>
              <div className="mt-2 inline-flex items-center justify-center rounded-md bg-red-600 px-2.5 py-1.5 text-white font-bold">
                {ratingScore.toString().replace(".", ",")}
              </div>
            </div>
          </div>

          {/* Chips: primary tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t, idx) => (
              <Chip
                key={idx}
                className="bg-gray-100 text-gray-800 border border-gray-200"
              >
                {t}
              </Chip>
            ))}
          </div>

          {/* Chips: secondary categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c, idx) => (
              <Chip
                key={idx}
                className="bg-yellow-100 text-yellow-900 border border-yellow-200"
              >
                {c}
              </Chip>
            ))}
          </div>

          {/* Date range + summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700">
              {dateRangeLabel}
            </div>
            <div className="text-sm text-gray-500">{summary}</div>
          </div>

          {/* Price + CTA */}
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xl font-extrabold text-gray-900">
                {priceLabel}
              </div>
              <div className="text-sm text-gray-500">{priceNote}</div>
            </div>
            <button
              onClick={onClick}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-white font-semibold hover:bg-red-700 active:scale-95 transition"
            >
              Xem chỗ trống →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
