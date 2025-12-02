import React, { useState } from "react";

const DISTRICTS = [
  "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6",
  "Quận 7", "Quận 8", "Quận 10", "Quận 11",
  "Quận Bình Thạnh", "Quận Tân Bình", "Quận Tân Phú",
  "Quận Gò Vấp", "Quận Phú Nhuận", "Thủ Đức",
  "Bình Tân", "Bình Chánh", "Nhà Bè", "Hóc Môn", "Củ Chi"
];

export default function SelectDistrict({ onClose, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = DISTRICTS.filter(d =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/25 backdrop-blur flex justify-center items-center z-50"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-5 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <p className="text-lg font-bold mb-3">Chọn Quận</p>

        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm quận..."
          className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-2">

          {/* ⭐ Nút chọn tất cả */}
          <button
            onClick={() => onSelect("")}
            className="w-full text-left p-3 border rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          >
            Tất cả
          </button>

          {/* Danh sách quận */}
          {filtered.map((district) => (
            <button
              key={district}
              onClick={() => onSelect(district)}
              className="w-full text-left p-3 border rounded-lg hover:bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              {district}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
