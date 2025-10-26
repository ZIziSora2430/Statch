function SearchingBar({className}){
    return(
        <div className={`bg-[#9C1A24] w-full flex justify-center gap-4 flex-wrap py-6 ${className}`}>
           {/* Ô nhập 1 */}
            <div className="relative">
        
                <label className="absolute -top-5 left-6 text-white font-semibold text-sm px-2 rounded">
                Điểm đến
                </label>

                <div className="bg-white rounded-full w-[359px] h-[70px] shadow-md flex items-center justify-center">
                <input
                    type="text"
                    placeholder="TP. Hồ Chí Minh"
                    className="px-4 py-2 w-[280px] focus:ring-2 focus:ring-[#D51E32] outline-none rounded-full"
                />
                </div>
            </div>

             <div className="relative">
        
                <label className="absolute -top-5 left-6 text-white font-semibold text-sm px-2 rounded">
                Ngày check-in/check-out
                </label>

                <div className="bg-white rounded-full w-[359px] h-[70px] shadow-md flex items-center justify-center">
                <input
                    type="text"
                    placeholder="26/12/2025-27/12/2025"
                    className="px-4 py-2 w-[280px] focus:ring-2 focus:ring-[#D51E32] outline-none rounded-full"
                />
                </div>
            </div>

            <div className="relative">
        
                <label className="absolute -top-5 left-6 text-white font-semibold text-sm px-2 rounded">
                Số lượng người
                </label>

                <div className="bg-white rounded-full w-[359px] h-[70px] shadow-md flex items-center justify-center">
                <input
                    type="text"
                    placeholder="1 người"
                    className="px-4 py-2 w-[280px] focus:ring-2 focus:ring-[#D51E32] outline-none rounded-full"
                />
                </div>
            </div>

            <button className="bg-[#D51E32] hover:bg-[#b71827] text-white font-semibold px-6 h-[70px] rounded-full shadow-md">
            Tìm kiếm
            </button>

        </div>
    );
};

export default SearchingBar; 