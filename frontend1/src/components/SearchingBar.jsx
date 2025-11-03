export default function SearchSection() {
  return (
    <div className="w-full flex justify-center -mt-8">
      {/* Nền đỏ */}
      <div className="relative w-full max-w-5xl bg-[#BF1D2D] rounded-2xl py-1 px-2 shadow-lg">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-wrap items-center gap-4 justify-between"
        >
          {/* Ô 1: Điểm đến */}
          <input
            type="text"
            placeholder="Điểm đến"
            className="flex-1 min-w-[180px] bg-white rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Ô 2: Ngày */}
          <input
            type="text"
            placeholder="Ngày đi"
            className="flex-1 min-w-[180px] bg-white rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Ô 3: Số khách */}
          <input
            type="text"
            placeholder="Số khách"
            className="flex-1 min-w-[180px] bg-white rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-400"
          />

          {/* Nút Tìm */}
          <button
            type="submit"
            className="px-6 py-3 text-white font-semibold rounded-xl hover:bg-[#f85464] transition"
          >
            Tìm
          </button>
        </form>
      </div>
    </div>
  );
}
