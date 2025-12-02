// components/ResultBar.jsx
import React from "react";
import { Crown, Building2, Home, Tent, Hotel, Sparkles } from "lucide-react";

const TAG_STYLES = {
  blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100",
  gray: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
  rose: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
};

// 2. Hàm phân tích ngữ nghĩa để chọn màu (Semantic Coloring)
const getSmartTagStyle = (tagName) => {
  if (!tagName) return TAG_STYLES.gray;
  const lower = tagName.toLowerCase();

  // Nhóm Biển / Nước -> Xanh dương
  if (['biển', 'bơi', 'hồ', 'nước', 'suối'].some(k => lower.includes(k))) return TAG_STYLES.blue;
  
  // Nhóm Thiên nhiên -> Xanh lá
  if (['vườn', 'cây', 'rừng', 'đồi', 'xanh', 'thiên nhiên'].some(k => lower.includes(k))) return TAG_STYLES.green;
  
  // Nhóm Cảm xúc / View -> Tím/Indigo
  if (['view', 'chill', 'thơ', 'mộng', 'lãng mạn', 'yên tĩnh'].some(k => lower.includes(k))) return TAG_STYLES.indigo;
  
  // Nhóm Sang trọng / Cao cấp -> Hồng/Rose
  if (['luxury', 'sang', 'vip', 'cao cấp'].some(k => lower.includes(k))) return TAG_STYLES.rose;
  
  // Nhóm Tiện nghi / Ăn uống -> Cam
  if (['bbq', 'bếp', 'ăn', 'cafe', 'nhà hàng', 'wifi', 'tv'].some(k => lower.includes(k))) return TAG_STYLES.orange;

  return TAG_STYLES.gray; // Mặc định
};

const getCategoryConfig = (label) => {
    if (!label) return { style: "from-gray-700 to-gray-600", icon: Sparkles };
    
    const lower = label.toLowerCase();

    // KHÁCH SẠN -> Màu Xanh Dương Đậm (Chuyên nghiệp)
    if (['hotel', 'khách sạn'].some(k => lower.includes(k))) {
        return { 
            style: "from-blue-600 to-blue-500", 
            icon: Hotel 
        };
    }

    // VILLA / BIỆT THỰ -> Màu Vàng Gold / Cam (Sang trọng)
    if (['villa', 'biệt thự', 'resort'].some(k => lower.includes(k))) {
        return { 
            style: "from-amber-500 to-orange-500", 
            icon: Crown 
        };
    }

    // HOMESTAY -> Màu Xanh Lá / Teal (Thân thiện, thiên nhiên)
    if (['homestay', 'nhà dân'].some(k => lower.includes(k))) {
        return { 
            style: "from-emerald-600 to-teal-500", 
            icon: Tent 
        };
    }

    // CĂN HỘ -> Màu Tím / Indigo (Hiện đại)
    if (['apartment', 'căn hộ', 'chung cư'].some(k => lower.includes(k))) {
        return { 
            style: "from-indigo-600 to-purple-500", 
            icon: Building2 
        };
    }

    // NHÀ RIÊNG -> Màu Đỏ (Ấm cúng)
    if (['house', 'nhà riêng', 'nguyên căn'].some(k => lower.includes(k))) {
        return { 
            style: "from-[#BF1D2D] to-red-500", 
            icon: Home 
        };
    }

    // Mặc định -> Màu xám đậm
    return { style: "from-gray-700 to-gray-600", icon: Sparkles };
}

// 3. Component Tag Chip Mới
const TagChip = ({ label, isCategory = false }) => {
  if (!label) return null;
  
  // Nếu là Category (Loại phòng) thì style riêng cho nổi bật
  if (isCategory) {
    const config = getCategoryConfig(label);
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${config.style} text-white shadow-md transform -translate-y-0.5`}>
        <Icon size={12} fill="currentColor" className="opacity-90" /> 
        {label}
      </span>
    );
  }

  // Style cho Tag thường
  const styleClass = getSmartTagStyle(label);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-default ${styleClass}`}>
      {/* Dấu chấm trang trí nhỏ */}
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 mr-1.5"></span>
      {label}
    </span>
  );
};


export default function ResultBar({
  image,
  title = "Chỗ ở chưa đặt tên",
  ratingText = "Mới",
  ratingCount = 0,
  ratingScore = 0,
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
          <div className="absolute top-3 left-3 flex gap-1">
             {categories.map((c, idx) => c && <TagChip key={idx} label={c} isCategory={true} />)}
          </div>
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
                  <TagChip key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 uppercase text-[10px] tracking-wide">
                    {c}
                  </TagChip>
                 ) : null
              ))}
            </div>
            
           {/* --- TAGS LIST --- */}
            <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, 5).map((tag, index) => (
                    <TagChip key={index} label={tag} />
                ))}
                {tags.length > 5 && (
                    <span className="text-xs text-gray-400 self-center font-medium pl-1">+{tags.length - 5} khác</span>
                )}
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