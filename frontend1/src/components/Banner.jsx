import React from 'react';

const Banner = ({ username }) => {
    return(
        // Mảng màu đỏ (bg-red-600) với padding (p-6/p-10)
        <div className="bg-linear-to-b from-[#D51E32] to-[#9C1A24] py-6 md:p-10 text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Tiêu đề chính */}
                <h1 className="text-3xl md:text-5xl font-bold">
                    {/* Sử dụng biến userName để hiển thị tên đăng nhập */}
                    {username}, kế tiếp bạn sẽ du lịch đến đâu?
                </h1>
            </div>
            
        </div>
    );
};

export default Banner; 