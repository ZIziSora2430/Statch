import { MapPin } from "lucide-react";

export default function CityButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-medium transition"
    >
      <MapPin size={18} />
      Chọn địa điểm
    </button>
    
  );
}