import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUpload from '../components/CloudinaryUpload.jsx';

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

export default function ModifyAccommodationForm() {
    const navigate = useNavigate();

    // Lấy accommodationId từ location state (nếu có)
    const { id } = useParams();
    const accommodationId = id;


    // === STATE ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     
    const [price, setPrice] = useState(0);            
    const [maxGuests, setMaxGuests] = useState(1);    
    const [propertyType, setPropertyType] = useState('Khách sạn'); 
    const [description, setDescription] = useState('');
    const [pictureUrl, setPictureUrl] = useState(""); 
    
    // Giữ nguyên tọa độ nếu user không đổi địa chỉ
    const [latitude, setLatitude] = useState(null);  
    const [longitude, setLongitude] = useState(null);
    // State UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // Loading khi lấy dữ liệu ban đầu
    useEffect(() => {
        if (!accommodationId) {
            alert("Không tìm thấy ID chỗ ở cần sửa!");
            navigate('/profile'); // Quay về profile nếu lỗi
            return;
        }
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem("access_token");
                // Gọi API lấy chi tiết (dùng endpoint public hoặc owner đều được)
                const response = await fetch(`${API_URL}/api/accommodations/${accommodationId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // "Đổ" dữ liệu vào form
                    setTitle(data.title || '');
                    setLocation(data.location || '');
                    setPrice(data.price || 0);
                    setMaxGuests(data.max_guests || 1);
                    setPropertyType(data.property_type || 'Khách sạn');
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
            description: description || null, 
            picture_url: pictureUrl || null,
            // Giữ nguyên tọa độ cũ (backend sẽ tự tính lại nếu location đổi)
            latitude: latitude, 
            longitude: longitude,
        };


        try {
            // Gọi API đến endpoint đã định nghĩa trong owner_router.py
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
        navigate('/profile'); // Quay về trang danh sách
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
                        placeholder="Nhập địa chỉ chính xác"
                    />
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
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Hình ảnh</label>
                    
                    <ImageUpload 
                        // Truyền ảnh cũ từ DB vào để hiển thị
                        defaultImages={pictureUrl}
                        
                        // Khi thêm/xóa ảnh, cập nhật lại chuỗi URL
                        onUploadSuccess={(urlsArray) => setPictureUrl(urlsArray.join(','))}
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