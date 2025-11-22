import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUpload from '../components/CloudinaryUpload.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

import { geocodeAddress } from '../utils/geocoding.js';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BASE_FONT = 'Montserrat';

const formGroupStyle = {
    marginBottom: '20px',
};

const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '18px',
    fontFamily: BASE_FONT,
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700',
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

export default function ModifyAccommodationForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const accommodationId = id;

    // === STATE ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     // Địa chỉ lưu DB
    const [price, setPrice] = useState(0);            
    const [maxGuests, setMaxGuests] = useState(1);    
    const [propertyType, setPropertyType] = useState('hotel'); 
    const [description, setDescription] = useState('');
    const [pictureUrl, setPictureUrl] = useState(""); 
    
    const [latitude, setLatitude] = useState(null);  
    const [longitude, setLongitude] = useState(null);
    
    // State mới cho tìm kiếm Map (Tách biệt với location)
    const [searchQuery, setSearchQuery] = useState('');

    // State UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); 

    // State Map Searching
    const [isSearching, setIsSearching] = useState(false);     
    const [searchError, setSearchError] = useState("");        

    // State AI
    const [isGenerating, setIsGenerating] = useState(false);

    // --- 1. LẤY DỮ LIỆU CŨ TỪ DB ---
    useEffect(() => {
        if (!accommodationId) {
            alert("Không tìm thấy ID chỗ ở cần sửa!");
            navigate('/profile'); 
            return;
        }
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/api/accommodations/${accommodationId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Đổ dữ liệu vào form
                    setTitle(data.title || '');
                    setLocation(data.location || '');
                    setPrice(data.price || 0);
                    setMaxGuests(data.max_guests || 1);
                    setPropertyType(data.property_type || 'hotel');
                    setDescription(data.description || '');
                    setPictureUrl(data.picture_url || '');
                    setLatitude(data.latitude);
                    setLongitude(data.longitude);
                } else {
                    setError("Không thể tải thông tin chỗ ở.");
                }
            } catch (err) {
                console.error(err);
                setError("Lỗi kết nối khi tải dữ liệu.");
            } finally {
                setFetching(false);
            }
        };

        fetchDetails();
    }, [accommodationId, navigate]);

    // --- 2. XỬ LÝ KHI THẢ GHIM (Map -> Input) ---
    const handleLocationSelect = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
        // KHÔNG cập nhật lại text địa chỉ để tránh mất dữ liệu user nhập
        console.log("Đã cập nhật tọa độ mới:", lat, lng);
    };

    // --- 3. XỬ LÝ KHI GÕ TÌM KIẾM (Search Input -> Map) ---
    useEffect(() => {
        if (!searchQuery) return;
        
        let isActive = true;
        setSearchError("");

        const timerId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const coords = await geocodeAddress(searchQuery);
                
                if (isActive && coords) {
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

    // --- 4. HÀM AI GENERATE ---
    const handleAIGenerate = async () => {
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
                    features: description 
                })
            });
            const data = await response.json();

            if (response.ok) {
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

    // Hàm format tiền tệ
    const formatCurrency = (value) => {
        if (!value) return "";
        const number = value.replace(/\D/g, ""); 
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    // --- 5. SUBMIT FORM ---
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
            description: description || null, 
            picture_url: pictureUrl || null,
            latitude: latitude, 
            longitude: longitude,
        };

        try {
            const response = await fetch(`${API_URL}/api/owner/accommodations/${accommodationId}`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Cập nhật chỗ ở thành công!`);
                // Có thể navigate về profile sau 1s
                // setTimeout(() => navigate('/profile'), 1500);
            } else {
                const detail = data.detail || "Lỗi cập nhật";
                setError(`Lỗi (${response.status}): ${JSON.stringify(detail)}`);
            }

        } catch (err) {
            console.error("Update error:", err);
            setError("Lỗi kết nối server.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile'); 
    };

    if (fetching) return <div style={{textAlign: 'center', padding: 50}}>Đang tải thông tin...</div>;

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
                Thay đổi thông tin
            </h1>
            
            <p style={{ 
                color: '#AD0000', 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '30px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10px'
            }}>
                *Chỉnh sửa các thông tin bên dưới
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
                {/* 1. Tên chỗ ở */}
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

                {/* 2. Địa chỉ & Bản đồ (Cấu trúc mới giống AddForm) */}
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Địa chỉ</label>

                    {/* A. Ô CHI TIẾT (Lưu DB) */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{fontSize: '14px', color: '#666', marginBottom: '4px', display:'block'}}>
                            *Địa chỉ chính xác hiển thị cho khách (bao gồm số nhà, hẻm, phường...)
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="Ví dụ: 11 Công trường Mê Linh, Bến Nghé, Quận 1..."
                        />
                    </div>

                    {/* B. CÔNG CỤ TÌM MAP (Chỉ dùng để search) */}
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px', 
                        border: '1px dashed #ccc' 
                    }}>
                        <label style={{fontSize: '15px', fontWeight: '600', color: '#007bff', marginBottom: '8px', display: 'block'}}>
                            🔍 Công cụ thay đổi vị trí bản đồ
                        </label>
                        <input
                            type="text"
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{...inputStyle, fontSize: '15px'}}
                            placeholder="Nhập tên đường/khu vực để bản đồ bay tới đó (VD: Chợ Bến Thành)..."
                        />
                        {isSearching && <span style={{fontSize: '12px', color: '#e67e22'}}>⏳ Đang tìm map...</span>}
                        {searchError && <span style={{fontSize: '12px', color: 'red'}}>{searchError}</span>}
                    </div>
                    
                    {/* C. BẢN ĐỒ */}
                    {latitude && longitude && (
                        <div style={{ 
                            marginTop: '15px', 
                            border: '1px solid #ddd', 
                            padding: '10px', 
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
                                <label style={{ fontSize: '14px', fontWeight: '700', color: '#AD0000', margin:0 }}>
                                    📍 Cập nhật vị trí chính xác
                                </label>
                                <span style={{fontSize: '12px', color: '#888'}}>
                                    (Kéo ghim đỏ đến vị trí mới nếu muốn thay đổi)
                                </span>
                            </div>
                            <LocationPicker 
                                defaultLat={parseFloat(latitude)} 
                                defaultLng={parseFloat(longitude)} 
                                onLocationSelect={handleLocationSelect}
                            />
                             <p style={{fontSize: 12, color: '#999', marginTop: 5}}>
                                Lat: {parseFloat(latitude).toFixed(6)}, Lng: {parseFloat(longitude).toFixed(6)}
                            </p>
                        </div>
                    )}
                </div>

                {/* 3. Giá (Có format) */}
                <div style={formGroupStyle}>
                    <label htmlFor="price" style={labelStyle}>Giá (VNĐ/Đêm)</label>
                    <input
                        type="text"
                        id="price"
                        value={formatCurrency(String(price))}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, "");
                            if (!isNaN(rawValue)) {
                                setPrice(rawValue); 
                            }
                        }}
                        required
                        style={inputStyle}
                        placeholder="Ví dụ: 500.000"
                    />
                </div>

                {/* 4. Số khách */}
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
                    />
                </div>
                
                {/* 5. Loại chỗ ở */}
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
                
                {/* 6. Mô tả (Có nút AI) */}
                <div style={formGroupStyle}>
                    <label htmlFor="description" style={labelStyle}>Mô tả</label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="6"
                            style={{ 
                                ...inputStyle, 
                                resize: 'vertical',
                                paddingBottom: '50px', // Chừa chỗ cho nút AI
                                borderColor: isGenerating ? '#ec4899' : '#ccc',
                                backgroundColor: isGenerating ? '#fff0f7' : 'white'
                            }}
                            placeholder="Mô tả chi tiết về chỗ ở..."
                        />
                        <button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                            style={{
                                position: 'absolute',
                                bottom: '12px', 
                                right: '12px',
                                zIndex: 10,
                                background: isGenerating ? '#ccc' : 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', 
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: 0.9
                            }}
                        >
                            {isGenerating ? (
                                <> <span className="animate-spin">⏳</span> Đang viết... </>
                            ) : (
                                <>✨ Viết lại bằng AI</>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* 7. UPLOAD ẢNH */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Hình ảnh</label>
                    <ImageUpload 
                        defaultImages={pictureUrl}
                        onUploadSuccess={(urlsArray) => setPictureUrl(urlsArray.join(','))}
                    />
                </div>

                {/* Nút HÀNH ĐỘNG */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
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
                            opacity: 0.9,
                        }}
                    >
                        Hủy
                    </button>

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
                        }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}