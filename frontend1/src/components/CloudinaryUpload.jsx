import { useState, useEffect } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUpload({ onUploadSuccess, defaultImages = "" }) {
  // State quản lý danh sách ảnh hiển thị (bao gồm cả ảnh thật và ảnh đang chờ)
  // Cấu trúc item: { url: "...", isUploading: boolean }
  const [imageList, setImageList] = useState([]);

  // 1. Khởi tạo dữ liệu từ defaultImages (khi vào trang Sửa)
  useEffect(() => {
    if (defaultImages) {
        const urls = Array.isArray(defaultImages) ? defaultImages : defaultImages.split(',');
        // Chỉ set nếu danh sách hiện tại đang rỗng (tránh loop vô hạn)
        if (imageList.length === 0 && urls.length > 0 && urls[0] !== "") {
            setImageList(urls.map(url => ({ url: url, isUploading: false })));
        }
    }
  }, [defaultImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // A. TẠO PREVIEW NGAY LẬP TỨC (User thấy sướng mắt liền)
    const newLocalImages = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9), // ID tạm
        url: URL.createObjectURL(file), // Tạo URL ảo để xem trước
        file: file, 
        isUploading: true // Đánh dấu đang upload
    }));

    // Cập nhật giao diện ngay: Ảnh cũ + Ảnh mới (đang load)
    setImageList(prev => [...prev, ...newLocalImages]);

    // B. UPLOAD NGẦM LÊN CLOUDINARY
    const uploadedResults = [];
    
    // Dùng Promise.all để upload song song cho nhanh
    await Promise.all(newLocalImages.map(async (localItem) => {
        const formData = new FormData();
        formData.append("file", localItem.file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            
            if (data.secure_url) {
                uploadedResults.push({ tempId: localItem.id, realUrl: data.secure_url });
            }
        } catch (error) {
            console.error("Lỗi upload:", error);
        }
    }));

    // C. CẬP NHẬT LẠI URL THẬT VÀO STATE VÀ GỬI VỀ CHA
    setImageList(prevState => {
        // Thay thế URL ảo bằng URL thật từ Cloudinary
        const nextState = prevState.map(img => {
            const found = uploadedResults.find(res => res.tempId === img.id);
            if (found) {
                return { ...img, url: found.realUrl, isUploading: false };
            }
            return img;
        });

        // Lọc lấy danh sách các URL đã hoàn tất để gửi về form cha
        const realUrls = nextState
            .filter(img => !img.isUploading)
            .map(img => img.url);
            
        
        return nextState;
    });
  };

  useEffect(() => {
        // Bỏ qua lần render đầu nếu chưa có dữ liệu gì
        if (imageList.length === 0 && defaultImages === "") return;

        const isUploading = imageList.some(img => img.isUploading);
        if (!isUploading) {
            const realUrls = imageList.map(img => img.url);
            onUploadSuccess(realUrls);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageList]);

  // Hàm xóa ảnh
  const removeImage = (indexToRemove) => {
      setImageList(prev => {
          const newState = prev.filter((_, index) => index !== indexToRemove);
          // Gửi danh sách mới về cha
          const realUrls = newState.filter(img => !img.isUploading).map(img => img.url);
          onUploadSuccess(realUrls);
          return newState;
      });
  };

  return (
    <div style={{
        backgroundColor: '#F8F9FA',
        border: '2px dashed #AD0000', // Viền đỏ đứt
        borderRadius: '12px',
        padding: '20px',
        minHeight: '200px', // Chiều cao tối thiểu
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap', // Cho phép xuống dòng
        gap: '15px',
        alignItems: 'flex-start' // Căn trên
    }}>
        
        {/* TRƯỜNG HỢP 1: CHƯA CÓ ẢNH NÀO -> HIỆN CHỮ TO GIỮA MÀN HÌNH */}
        {imageList.length === 0 && (
            <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                pointerEvents: 'none' // Để click xuyên qua xuống input
            }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#AD0000', margin: 0 }}>
                    UPLOAD ẢNH
                </h2>
                <p style={{ color: '#777', marginTop: '10px' }}>
                    Bấm vào để thêm ảnh (JPG, PNG...)
                </p>
            </div>
        )}

        {/* TRƯỜNG HỢP 2: ĐÃ CÓ ẢNH -> HIỆN DANH SÁCH ẢNH */}
        {imageList.map((item, index) => (
            <div key={index} style={{ 
                width: '100px', height: '100px', position: 'relative', 
                borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                backgroundColor: 'white', zIndex: 2 // Nổi lên trên input nền
            }}>
                <img 
                    src={item.url} 
                    alt="thumb" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: item.isUploading ? 0.5 : 1 }} 
                />
                
                {/* Loading Spinner */}
                {item.isUploading && (
                    <div style={{ position: 'absolute', top: '35%', left: '35%', fontSize: '20px' }}>⏳</div>
                )}

                {/* Nút Xóa */}
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(index); }} // Chặn click lan ra ngoài
                    style={{
                        position: 'absolute', top: '2px', right: '2px',
                        backgroundColor: 'rgba(255,0,0,0.8)', color: 'white',
                        border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                        cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >✕</button>
            </div>
        ))}

        {/* NÚT DẤU CỘNG ĐỂ THÊM ẢNH (Input file luôn nằm ở đây hoặc phủ toàn bộ khi trống) */}
        <div style={{
            width: imageList.length > 0 ? '100px' : '100%', // Nếu có ảnh thì nhỏ lại, chưa có thì phủ hết
            height: imageList.length > 0 ? '100px' : '100%',
            position: imageList.length > 0 ? 'relative' : 'absolute',
            top: 0, left: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            borderRadius: '8px',
            border: imageList.length > 0 ? '2px dashed #ccc' : 'none', // Viền nhỏ khi đã có ảnh
            cursor: 'pointer',
            zIndex: 1
        }}>
            {/* Input tàng hình */}
            <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                }}
            />
            
            {/* Icon dấu cộng chỉ hiện khi đã có ảnh (để thêm tiếp) */}
            {imageList.length > 0 && (
                <span style={{ fontSize: '30px', color: '#ccc' }}>+</span>
            )}
        </div>

    </div>
  );
}