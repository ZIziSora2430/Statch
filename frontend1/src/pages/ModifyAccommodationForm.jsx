import React, { useState } from 'react';

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
    // === STATE KHỚP CHÍNH XÁC VỚI schemas.AccommodationCreate ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     // location (Địa chỉ)
    const [price, setPrice] = useState(0);            // price (Giá)
    const [maxGuests, setMaxGuests] = useState(1);    // max_guests (Số khách tối đa)
    const [propertyType, setPropertyType] = useState('apartment'); // property_type (Loại chỗ ở)
    const [description, setDescription] = useState('');// description (Mô tả)
    // Cần phải có giá trị mặc định cho các trường bắt buộc nhưng chưa có input UI
    const [pictureUrl, setPictureUrl] = useState("https://default-image.com/default.jpg"); 
    const [latitude, setLatitude] = useState(10.77);  // MOCK: Tọa độ mặc định (TP HCM)
    const [longitude, setLongitude] = useState(106.69); // MOCK: Tọa độ mặc định (TP HCM)

    // State UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
                setSuccess(`Đăng chỗ ở "${data.title}" thành công! Vui lòng chờ phê duyệt.`);
                // Reset form sau khi đăng thành công (Tùy chọn)
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
        // TODO: Cần thêm logic để chuyển về tab "Danh sách chỗ ở"
        // Ví dụ: setOwnerActiveSection('accoList'); (nếu có state đó)
        alert("Đã hủy bỏ việc chỉnh sửa thông tin chỗ ở. Các thay đổi sẽ không được lưu.");
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
                <div style={{
                    backgroundColor: '#E0E0E0',
                    height: '350px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '30px',
                    marginBottom: '50px',
                    border: '2px dashed #999'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#555' }}>
                        UPLOAD ẢNH
                    </h2>
                    <p style={{ color: '#777', marginTop: '10px' }}>
                        (URL mặc định được gửi lên: {pictureUrl})
                    </p>
                    {/* Input file thực tế sẽ được xử lý ở đây */}
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