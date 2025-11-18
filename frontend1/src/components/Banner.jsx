import React from 'react';

const Banner = ({ username }) => {
    return(
        // Mảng màu đỏ (bg-red-600) với padding (p-6/p-10)
  <div className="w-full bg-linear-to-b from-[#D51E32] to-[#9C1A24] pt-0 pb-10 text-white">
            <div className="max-w-7xl mx-auto py-10 md:py-46">
                {/* Tiêu đề chính */}
                <h1 className="-mt-12 text-3xl md:text-5xl font-bold">
                    {/* Sử dụng biến userName để hiển thị tên đăng nhập */}
                   <span>{username}, kế tiếp bạn sẽ du lịch đến đâu?</span>
                    <span> Hãy bắt đầu hành trình ngay hôm nay!</span>
                </h1>
            </div>
            
        </div>
    );
};

export default Banner; 