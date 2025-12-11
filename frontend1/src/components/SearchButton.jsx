// components/SearchInput.jsx
import { Search } from "lucide-react";

export default function SearchButton({ value, onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Tìm kiếm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 pl-10 focus-outline-none"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    </div>
  );
}
