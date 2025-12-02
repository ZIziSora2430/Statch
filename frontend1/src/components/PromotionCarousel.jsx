import { useState, useEffect } from 'react';
import promo1 from "../images/promo.png";
import promo2 from "../images/promo2.png";
import promo3 from "../images/promo3.png";
import promo4 from "../images/promo4.png";
import promo5 from "../images/promo1.png";

const promotions = [promo1, promo2, promo3, promo4,promo5];

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
    <div className="flex flex-col items-center justify-center bg-white p-4 font-sans">

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
         {/* Render các slide (hiển thị ảnh thật) */}
{promotions.map((promo, index) => {
  const prevIndex = (currentIndex - 1 + promotions.length) % promotions.length;
  const nextIndex = (currentIndex + 1) % promotions.length;

  let transform = "scale(0.7)";
  let opacity = "opacity-0";
  let zIndex = "z-0";
  let filter = "blur(4px)";

  if (index === currentIndex) {
    transform = "scale(1)";
    opacity = "opacity-100";
    zIndex = "z-20";
    filter = "blur(0)";
  } else if (index === prevIndex) {
    transform = "scale(0.8) translateX(-70%)";
    opacity = "opacity-50";
    zIndex = "z-10";
    filter = "blur(2px)";
  } else if (index === nextIndex) {
    transform = "scale(0.8) translateX(70%)";
    opacity = "opacity-50";
    zIndex = "z-10";
    filter = "blur(2px)";
  }

  return (
    <div
      key={promo}
      className={`absolute inset-0 transition-all duration-500 ease-in-out ${opacity} ${zIndex}`}
      style={{ transform, filter }}
    >
      <img
        src={promo}
        alt={`Slide ${index + 1}`}
        className="w-full h-full object-cover rounded-lg shadow-md"
        loading="lazy"
      />
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