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


    // State UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // Trạng thái đang tìm
    const [searchError, setSearchError] = useState("");    // Nội dung lỗi

    // State để tránh vòng lặp vô tận (Map update Input, Input update Map...)
    const [isMapUpdating, setIsMapUpdating] = useState(false);

    // --- A. XỬ LÝ KHI THẢ GHIM TRÊN BẢN ĐỒ (Map -> Input) ---
    const handleLocationSelect = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
        
        // Đánh dấu là Map đang update để useEffect bên dưới không chạy đè lại
        setIsMapUpdating(true); 

        // Gọi API lấy tên đường
        const addressName = await reverseGeocode(lat, lng);
        if (addressName) {
            setLocation(addressName); // Tự động điền vào ô input
        }
        
        // Reset cờ sau khi update xong
        setTimeout(() => setIsMapUpdating(false), 1000);
    };

    // --- B. XỬ LÝ KHI GÕ ĐỊA CHỈ (Input -> Map) ---
    // Dùng useEffect để lắng nghe thay đổi của 'location'
    useEffect(() => {
        // Nếu thay đổi này do Map gây ra thì bỏ qua (tránh loop)
        if (isMapUpdating || !location) return;
        let isActive = true;
        setSearchError("");
        

        // Kỹ thuật Debounce: Chờ người dùng ngừng gõ 1.5s mới tìm (để đỡ lag)
        const timerId = setTimeout(async () => {
            setIsSearching(true);
            console.log("🔍 Đang tìm tọa độ cho:", location);

            try{
            const coords = await geocodeAddress(location);
            //console.log(coords);
                if (isActive) {
                    if (coords) {
                        setLatitude(coords.lat);
                        setLongitude(coords.lng);
                        setLocation(coords.display_name);

                    } else {
                        // Không tìm thấy
                        setSearchError("Không tìm thấy địa chỉ này trên bản đồ. Vui lòng thử địa chỉ khác hoặc ghim thủ công.")
                    }
                }
            } catch (err) {
                setSearchError("Lỗi kết nối định vị.")
            } finally {
                setIsSearching(false);
            }
            
        }, 1500); // Chờ 1.5 giây

        return () => {
            isActive = false; 
            clearTimeout(timerId); // Xóa timer cũ nếu người dùng gõ tiếp
        };
    }, [location]);

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
                    <label htmlFor="location" style={labelStyle}>Địa chỉ</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        style={inputStyle}
                        placeholder="Nhập địa chỉ hoặc chọn trên bản đồ..."
                    />

                    {/* Trạng thái Đang tìm kiếm */}
                    {isSearching && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: '#007bff', fontSize: '14px' }}>
                            {/* Bạn có thể thêm icon Spinner xoay xoay ở đây nếu muốn */}
                            <span>⏳ Đang tìm vị trí trên bản đồ...</span>
                        </div>
                    )}

                    {/* Trạng thái Lỗi */}
                    {searchError && !isSearching && (
                        <div style={{ marginTop: '8px', color: '#B01C29', fontSize: '14px', fontWeight: '500' }}>
                            ⚠️ {searchError}
                        </div>
                    )}

                    <div style={{ marginTop: '15px' }}>
                        <label style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                            📍 Ghim vị trí chính xác trên bản đồ:
                        </label>
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
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01" // Cho phép nhập số thập phân nhỏ
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
                    <label htmlFor="description" style={labelStyle}>Mô tả</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="Mô tả chi tiết về chỗ ở, tiện ích và các quy tắc"
                    />
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