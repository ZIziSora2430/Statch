import { useState, useEffect } from 'react';

const promotions = [
    './src/images/carousel-1.jpg',
    './src/images/carousel-2.jpg',
    './src/images/carousel-3.jpg',
    './src/images/carousel-4.jpg',

  ];

  const ArrowLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// Icon mũi tên phải
const ArrowRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function PromotionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  // Giữ lại chức năng auto-play từ code của bạn
  useEffect(() => {
    // Đặt thời gian ngắn hơn một chút
    const interval = setInterval(nextSlide, 3000); 
    return () => clearInterval(interval);
    // Thêm mảng dependency rỗng để chạy 1 lần
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 font-sans">
      
      {/* Tiêu đề giống trong hình */}
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Các ưu đãi hiện có
      </h2>

      {/* Container của Carousel */}
      <div className="relative w-full max-w-3xl flex items-center justify-center h-64 md:h-80">
        
        {/* Nút Previous */}
        <button
          onClick={prevSlide}
          // Style nút màu đỏ với mũi tên trắng giống trong hình
          className="absolute left-0 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-red-700 text-white p-3 rounded-md shadow-lg hover:bg-red-800 transition-colors focus:outline-none"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon />
        </button>

        {/* Khung nhìn Carousel (Viewport) */}
        {/* Đặt kích thước cho slide ở giữa */}
        <div className="relative w-[280px] h-[180px] sm:w-[320px] sm:h-[200px] md:w-[400px] md:h-[250px] overflow-visible">
          
          {/* Render các slide */}
          {promotions.map((promo, index) => {
            const prevIndex = (currentIndex - 1 + promotions.length) % promotions.length;
            const nextIndex = (currentIndex + 1) % promotions.length;

            // Tính toán vị trí, độ mờ, v.v.
            let transform = 'scale(0.7) translateX(0)';
            let opacity = 'opacity-0';
            let zIndex = 'z-0';
            let filter = 'blur(4px)';

            if (index === currentIndex) {
              // Slide ở giữa: rõ, to nhất
              transform = 'scale(1) translateX(0)';
              opacity = 'opacity-100';
              zIndex = 'z-20';
              filter = 'blur(0)';
            } else if (index === prevIndex) {
              // Slide bên trái: mờ, nhỏ hơn
              transform = 'scale(0.8) translateX(-70%)';
              opacity = 'opacity-50';
              zIndex = 'z-10';
              filter = 'blur(2px)';
            } else if (index === nextIndex) {
              // Slide bên phải: mờ, nhỏ hơn
              transform = 'scale(0.8) translateX(70%)';
              opacity = 'opacity-50';
              zIndex = 'z-10';
              filter = 'blur(2px)';
            }
            // Các slide còn lại sẽ bị ẩn (opacity-0, scale(0.7))

            return (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${opacity} ${zIndex}`}
                style={{ transform, filter }}
              >
                {/* Nội dung slide (box màu xám) */}
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-2xl md:text-3xl font-bold text-gray-700">
                    {promo.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Nút Next */}
        <button
          onClick={nextSlide}
          // Style nút màu đỏ với mũi tên trắng giống trong hình
          className="absolute right-0 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-red-700 text-white p-3 rounded-md shadow-lg hover:bg-red-800 transition-colors focus:outline-none"
          aria-label="Next slide"
        >
          <ArrowRightIcon />
        </button>
      </div>

      {/* Link "Điều kiện" giống trong hình */}
      <a
        href="#"
        className="mt-8 text-sm font-medium text-gray-800 uppercase tracking-wider border-b-2 border-red-700 pb-1 hover:text-red-700 transition-colors"
      >
        Điều kiện
      </a>
    </div>
  );
  

}