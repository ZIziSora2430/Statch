import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/CloudinaryUpload.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

import { geocodeAddress, reverseGeocode } from '../utils/geocoding.js'

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const BASE_FONT = 'Montserrat';

const formGroupStyle = {
    marginBottom: '20px',
};

const inputStyle = {
    width: '100%',
    padding: '12px 15px', // Tăng padding để input trông lớn hơn
    border: '1px solid #ccc',
    borderRadius: '8px', // Làm tròn hơn so với trước
    boxSizing: 'border-box',
    fontSize: '18px', // Font lớn hơn
    fontFamily: BASE_FONT,
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700', // Đậm hơn
    fontSize: '18px',
    color: '#333',
    fontFamily: BASE_FONT,
};

const MOCK_TYPES = [
    { value: 'apartment', label: 'Căn hộ dịch vụ' },
    { value: 'house', label: 'Nhà riêng' },
    { value: 'room', label: 'Phòng trọ/Phòng đơn' },
    { value: 'hotel', label: 'Khách sạn' },
];

export default function AddAccommodationForm() {
    const navigate = useNavigate();

    // === STATE KHỚP CHÍNH XÁC VỚI schemas.AccommodationCreate ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     // location (Địa chỉ)
    const [price, setPrice] = useState(0);            // price (Giá)
    const [maxGuests, setMaxGuests] = useState(1);    // max_guests (Số khách tối đa)
    const [propertyType, setPropertyType] = useState('apartment'); // property_type (Loại chỗ ở)
    const [description, setDescription] = useState('');// description (Mô tả)
    // Cần phải có giá trị mặc định cho các trường bắt buộc nhưng chưa có input UI
    const [pictureUrl, setPictureUrl] = useState("");    
    const [latitude, setLatitude] = useState(10.77);  // MOCK: Tọa độ mặc định (TP HCM)
    const [longitude, setLongitude] = useState(106.69); // MOCK: Tọa độ mặc định (TP HCM)
    const [searchQuery, setSearchQuery] = useState('');
    // State UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // Trạng thái đang tìm
    const [searchError, setSearchError] = useState("");    // Nội dung lỗi

    // State để tránh vòng lặp vô tận (Map update Input, Input update Map...)
    const [isMapUpdating, setIsMapUpdating] = useState(false);

    // State cho AI
    const [isGenerating, setIsGenerating] = useState(false); // Trạng thái nút AI
    const handleAIGenerate = async () => {
        // 1. Kiểm tra xem Owner đã nhập từ khóa chưa
        if (!description || description.trim().length < 5) {
            alert("Vui lòng nhập vài từ khóa vào ô Mô tả trước (Ví dụ: view biển, yên tĩnh, gần chợ...)");
            return;
        }

        if (!title || !location) {
            alert("Vui lòng nhập Tên và Địa chỉ trước!");
            return;
        }

        setIsGenerating(true);
        const token = localStorage.getItem("access_token");

        try {
            const response = await fetch(`${API_URL}/api/owner/accommodations/generate-description`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    property_type: propertyType,
                    location: location,
                    // Lấy nội dung nháp từ description gửi đi làm gợi ý
                    features: description 
                })
            });
            const data = await response.json(); // Parse JSON dù thành công hay thất bại

            if (response.ok) {
                console.log("AI Response:", data);
                if (data.generated_description && !data.generated_description.startsWith("Lỗi")) {
                    setDescription(data.generated_description);
                } else {
                    alert(data.generated_description || "AI không trả về kết quả.");
                }
            } else {
                alert("Lỗi Server: " + (data.detail || response.statusText));
            }

        } catch (err) {
            console.error("AI Error:", err);
            alert("Lỗi kết nối đến Server.");
        } finally {
            setIsGenerating(false);
        }
    };
    // --- A. XỬ LÝ KHI THẢ GHIM TRÊN BẢN ĐỒ (Map -> Input) ---
    const handleLocationSelect = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
        console.log("Đã chọn tọa độ mới:", lat, lng);
    };

    // --- B. XỬ LÝ KHI GÕ ĐỊA CHỈ (Input -> Map) ---
    // Dùng useEffect để lắng nghe thay đổi của 'location'
    useEffect(() => {
        if (!searchQuery) return; // Nếu ô tìm kiếm rỗng thì thôi
        
        let isActive = true;
        setSearchError("");

        const timerId = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Gọi API tìm tọa độ dựa trên từ khóa tìm kiếm
                const coords = await geocodeAddress(searchQuery);
                
                if (isActive && coords) {
                    // Chỉ di chuyển Map đến đó
                    setLatitude(coords.lat);
                    setLongitude(coords.lng);
                    // KHÔNG sửa biến 'location' của người dùng
                } else if (isActive) {
                    setSearchError("Không tìm thấy địa điểm này.");
                }
            } catch (err) {
                setSearchError("Lỗi kết nối định vị.");
            } finally {
                setIsSearching(false);
            }
        }, 1500);

        return () => {
            isActive = false; 
            clearTimeout(timerId);
        };
    }, [searchQuery]);
    
    // Hàm format tiền tệ
    const formatCurrency = (value) => {
        if (!value) return "";
        // Xóa ký tự không phải số
        const number = value.replace(/\D/g, ""); 
        // Thêm dấu phẩy
        return new Intl.NumberFormat('vi-VN').format(number);
    };
    // Ham xu ly submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Lỗi xác thực. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
        }

        const payload = {
            title: title,
            location: location,
            price: parseFloat(price), 
            max_guests: parseInt(maxGuests), 
            property_type: propertyType,
            description: description || null, // Gửi null nếu trống (vì Optional)
            picture_url: pictureUrl, // Dùng URL mặc định/mock
            latitude: parseFloat(latitude), 
            longitude: parseFloat(longitude),
        };

        try {
            // Gọi API đến endpoint đã định nghĩa trong owner_router.py
            const response = await fetch(`${API_URL}/api/owner/accommodations/`, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!pictureUrl) {
                setError("Vui lòng upload ít nhất 1 hình ảnh cho chỗ ở này.");
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Đăng chỗ ở "${data.title}" thành công!`);                // Reset form sau khi đăng thành công
                setTitle(''); setLocation(''); setPrice(0); setMaxGuests(1); setDescription('');
            } else {
                const detail = data.detail || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
                setError(`Lỗi (${response.status}): ${JSON.stringify(detail)}`);
            }

        } catch (err) {
            console.error("Submit accommodation error:", err);
            setError("Lỗi kết nối. Không thể gửi dữ liệu lên server.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

        return (
        <div style={{ 
            padding: '20px 40px', 
            maxWidth: '923px',
            margin: '0 auto', 
            fontFamily: BASE_FONT 
        }}>
            
            <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: '#333', 
                marginBottom: '10px' 
            }}>
                Thêm chỗ ở mới
            </h1>
            
            <p style={{ 
                color: '#AD0000', 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '30px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10px'
            }}>
                *Vui lòng điền đầy đủ các thông tin sau
            </p>

            {/* Messages */}
            {loading && <p style={{ color: '#007bff', textAlign: 'center' }}>Đang xử lý...</p>}
            {error && (
                <p style={{ color: '#B01C29', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>
                    ⚠️ {error}
                </p>
            )}
            {success && (
                <p style={{ color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' }}>
                    ✅ {success}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                {/* 1. Tên chỗ ở (title) */}
                <div style={formGroupStyle}>
                    <label htmlFor="title" style={labelStyle}>Tên chỗ ở</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={inputStyle}
                        placeholder="Nhập tên chỗ ở"
                    />
                </div>

                {/* 2. Địa chỉ (location) */}
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Địa chỉ chỗ ở</label>
                    

                    {/* B. Ô CHI TIẾT (ĐƯA LÊN ĐÂY) */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{fontSize: '14px', color: '#666', marginBottom: '4px', display:'block'}}>
                            *Nhập địa chỉ chính xác hiển thị cho khách (bao gồm số nhà, hẻm, phường...)
                        </label>
                        <input
                            type="text"
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)}
                            style={inputStyle}
                            placeholder="Ví dụ: 11 Công trường Mê Linh, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh"
                            required
                        />
                    </div>
                    {/* A. Ô TÌM KIẾM (GOOGLE) */}
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px', 
                        border: '1px dashed #ccc' 
                    }}>
                        <label style={{fontSize: '15px', fontWeight: '600', color: '#007bff', marginBottom: '8px', display: 'block'}}>
                            🔍 Công cụ lấy tọa độ bản đồ
                        </label>
                        <input
                            type="text"
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{...inputStyle, fontSize: '15px'}}
                            placeholder="Nhập tên đường/khu vực để bản đồ bay tới đó (VD: Chợ Bến Thành)..."
                        />
                        {/* Thông báo trạng thái tìm kiếm */}
                        {isSearching && <span style={{fontSize: '12px', color: '#e67e22'}}>⏳ Đang tìm map...</span>}
                        {searchError && <span style={{fontSize: '12px', color: 'red'}}>{searchError}</span>}
                    </div>

                    {/* C. BẢN ĐỒ  */}
                    <div style={{ 
                        marginTop: '15px', 
                        border: '1px solid #ddd', 
                        padding: '10px', 
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#AD0000', margin:0 }}>
                                Ghim vị trí chính xác
                            </label>
                            <span style={{fontSize: '12px', color: '#888'}}>
                                (Kéo ghim đỏ đến đúng mái nhà của bạn)
                            </span>
                        </div>
                        
                        <LocationPicker 
                            defaultLat={latitude} 
                            defaultLng={longitude} 
                            onLocationSelect={handleLocationSelect}
                        />
                        {/* Hiển thị tọa độ nhỏ bên dưới*/}
                        <p style={{fontSize: 12, color: '#999', marginTop: 5}}>
                            Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                        </p>
                    </div>
                </div>
                {/* 3. Giá (price) */}
                <div style={formGroupStyle}>
                    <label htmlFor="price" style={labelStyle}>Giá (VNĐ/Đêm)</label>
                    <input
                        type="text"
                        id="price"
                        value={formatCurrency(String(price))}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, "");
                            if (!isNaN(rawValue)) {
                                setPrice(rawValue); // Lưu giá trị thô vào state để gửi API
                            }
                        }}
                        min="0"
                        required
                        style={inputStyle}
                        placeholder="Ví dụ: 500000"
                    />
                </div>

                {/* 4. Số khách tối đa (max_guests) */}
                <div style={formGroupStyle}>
                    <label htmlFor="maxGuests" style={labelStyle}>Số khách tối đa</label>
                    <input
                        type="number"
                        id="maxGuests"
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(e.target.value)}
                        min="1"
                        required
                        style={inputStyle}
                        placeholder="Nhập số lượng khách tối đa cho phép"
                    />
                </div>
                
                {/* 5. Loại chỗ ở (property_type) */}
                <div style={formGroupStyle}>
                    <label htmlFor="propertyType" style={labelStyle}>Loại chỗ ở</label>
                    <select
                        id="propertyType"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        required
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    >
                        {MOCK_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                
                {/* 6. Mô tả (description) */}
                <div style={formGroupStyle}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '8px'}}>
                        <label htmlFor="description" style={{...labelStyle, marginBottom: 0}}>Mô tả chi tiết</label>
                    </div>

                    {/* 👇 TẠO MỘT DIV WRAPPER CÓ POSITION RELATIVE 👇 */}
                    <div style={{ position: 'relative' }}>
                        
                        {/* TEXTAREA */}
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="6"
                            style={{ 
                                ...inputStyle, 
                                resize: 'vertical',
                                lineHeight: '1.5',
                                // 👇 QUAN TRỌNG: Thêm padding dưới để chữ không bị nút che
                                paddingBottom: '50px', 
                                borderColor: isGenerating ? '#ec4899' : '#ccc',
                                backgroundColor: isGenerating ? '#fff0f7' : 'white'
                            }}
                            placeholder="Nhập các ý chính vào đây (VD: Nhà gần biển, có sân thượng...) rồi bấm nút AI góc dưới."
                        />

                        {/* NÚT AI - ĐẶT VÀO TRONG WRAPPER */}
                        <button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                            title="Bấm để AI viết lại nội dung cho hay hơn"
                            style={{
                                // 👇 ĐỊNH VỊ NÚT VÀO GÓC DƯỚI PHẢI
                                position: 'absolute',
                                bottom: '12px', 
                                right: '12px',
                                zIndex: 10,

                                // Style giao diện nút (giữ nguyên như cũ)
                                background: isGenerating ? '#ccc' : 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', 
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px', // Bo góc ít hơn để hợp với input
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease',
                                opacity: 0.9
                            }}
                            onMouseOver={(e) => !isGenerating && (e.currentTarget.style.opacity = '1')}
                            onMouseOut={(e) => !isGenerating && (e.currentTarget.style.opacity = '0.9')}
                        >
                            {isGenerating ? (
                                <>
                                    {/* Icon xoay loading đơn giản */}
                                    <span className="animate-spin">⏳</span> Đang viết...
                                </>
                            ) : (
                                <>✨ Viết lại bằng AI</>
                            )}
                        </button>
                    </div>
                    
                    <p style={{fontSize: '12px', color: '#888', marginTop: '5px', fontStyle: 'italic'}}>
                        *Mẹo: Nhập các ý chính vào ô trên rồi bấm "Viết lại bằng AI" để tạo nội dung hấp dẫn tự động.
                    </p>
                </div>


                {/* 7. UPLOAD ẢNH (picture_url) */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Hình ảnh</label>
                    <ImageUpload 
                        // 3. Logic mới: Khi nhận mảng url từ con, gộp thành chuỗi ngăn cách dấu phẩy
                        onUploadSuccess={(urlsArray) => setPictureUrl(urlsArray.join(','))} 
                        
                        // Truyền chuỗi hiện tại vào để hiển thị lại nếu cần
                        defaultImages={pictureUrl}
                    />
                </div>


                {/* Nút HÀNH ĐỘNG */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
                    
                    {/* Nút Hủy */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            backgroundColor: '#AD0000',
                            color: 'white',
                            padding: '10px 30px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '20px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                            opacity: 0.9,
                        }}
                    >
                        Hủy
                    </button>

                    {/* Nút Lưu (Submit) */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#878787' : '#AD0000',
                            color: 'white',
                            padding: '10px 30px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '20px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                        }}
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );

}