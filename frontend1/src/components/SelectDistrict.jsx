import React, { useState } from "react";

// ĐÃ SỬA: Thêm value để gửi lên API
const DISTRICTS = [
  { value: "district1", label: "Quận 1" },
  { value: "district2", label: "Quận 2" },
  { value: "district3", label: "Quận 3" },
  { value: "district4", label: "Quận 4" },
  { value: "district5", label: "Quận 5" },
  { value: "district6", label: "Quận 6" },
  { value: "district7", label: "Quận 7" },
  { value: "district8", label: "Quận 8" },
  { value: "district9", label: "Quận 9" },
  { value: "district10", label: "Quận 10" },
  { value: "district11", label: "Quận 11" },
  { value: "district12", label: "Quận 12" },
  { value: "binh_thanh", label: "Quận Bình Thạnh" },
  { value: "binh_tan", label: "Quận Bình Tân" },
  { value: "phu_nhuan", label: "Quận Phú Nhuận" },
  { value: "tan_binh", label: "Quận Tân Bình" },
  { value: "tan_phu", label: "Quận Tân Phú" },
  { value: "go_vap", label: "Quận Gò Vấp" },
  { value: "thu_duc", label: "TP Thủ Đức" },
  { value: "hoc_mon", label: "Huyện Hóc Môn" },
  { value: "binh_chanh", label: "Huyện Bình Chánh" },
  { value: "nha_be", label: "Huyện Nhà Bè" },
  { value: "can_gio", label: "Huyện Cần Giờ" },
  { value: "cu_chi", label: "Huyện Củ Chi" },
];

export default function SelectDistrict({ onClose, onSelect, selectedValue }) {
  const [search, setSearch] = useState("");

  // Lọc theo label (tên tiếng Việt)
  const filtered = DISTRICTS. filter((d) =>
    d.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/25 backdrop-blur flex justify-center items-center z-50"
    >
      <div 
        onClick={(e) => e. stopPropagation()}
        className="bg-white p-5 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <p className="text-lg font-bold mb-3">Chọn Quận</p>

        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm quận..."
          className="w-full px-4 py-2. 5 mb-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-2">

          {/* Nút chọn tất cả */}
          <button
            onClick={() => onSelect("")}
            className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedValue === "" 
                ? "bg-red-700 text-white" 
                : "hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>

          {/* Danh sách quận */}
          {filtered.map((district) => (
            <button
              key={district.value}
              onClick={() => onSelect(district.value)}
              className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedValue === district.value 
                  ? "bg-red-700 text-white" 
                  : "hover:bg-gray-100"
              }`}
            >
              {district.label}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-4">Không tìm thấy quận nào</p>
          )}
        </div>

      </div>
    </div>
  );
}