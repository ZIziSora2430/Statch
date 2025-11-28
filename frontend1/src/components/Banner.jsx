import React from 'react';

const Banner = ({ username }) => {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
            {/* 1. ẢNH NỀN (Background Image) */}
            {/* Bạn có thể thay link ảnh này bằng ảnh local trong máy */}
            <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" 
                alt="Travel Background" 
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 2. LỚP PHỦ MÀU (Overlay) */}
            {/* Giúp chữ trắng nổi bật trên mọi loại ảnh nền */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60"></div>

            {/* 3. NỘI DUNG CHÍNH */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
                
                {/* Dòng chào mừng nhỏ bên trên */}
                <span className="mb-4 py-1 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-100 text-sm md:text-base font-medium tracking-wide">
                    👋 Xin chào, {username}!
                </span>

                {/* Tiêu đề lớn */}
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                    Kế tiếp bạn sẽ <br/> 
                    <span className="text-yellow-400">du lịch đến đâu?</span>
                </h1>

                {/* Dòng mô tả phụ */}
                <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl font-light">
                    Khám phá những điểm đến tuyệt vời, tận hưởng kỳ nghỉ mơ ước và tạo nên những kỷ niệm khó quên ngay hôm nay.
                </p>
            </div>
        </div>
    );
};

export default Banner;