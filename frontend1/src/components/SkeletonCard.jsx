// Component Skeleton giả lập hình dáng của Card thật
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse border border-gray-100">
      {/* 1. Giả lập Ảnh (Khối xám lớn) */}
      <div className="h-48 w-full bg-gray-300"></div> 
      
      <div className="p-4 space-y-3">
        {/* 2. Giả lập Tiêu đề (Thanh dài) */}
        <div className="h-6 bg-gray-300 rounded w-3/4"></div> 
        
        {/* 3. Giả lập Lý do AI (Thanh màu tím nhạt) */}
        <div className="h-12 bg-purple-50 rounded w-full"></div>
        
        {/* 4. Giả lập Địa điểm (Thanh ngắn) */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* 5. Giả lập Giá & Nút bấm */}
        <div className="flex justify-between items-center pt-2">
           <div className="h-6 bg-gray-200 rounded w-1/3"></div> {/* Giá */}
           <div className="h-8 bg-gray-200 rounded-full w-20"></div> {/* Nút */}
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 