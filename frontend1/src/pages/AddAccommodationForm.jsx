import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/CloudinaryUpload.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import { geocodeAddress } from '../utils/geocoding.js';

// Import Icons từ lucide-react (Cần cài: npm install lucide-react)
import { MapPin, ArrowLeft, Users, Home, Type, FileText, Search, Sparkles, Image as ImageIcon, Save, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MOCK_TYPES = [
    { value: 'apartment', label: 'Căn hộ dịch vụ' },
    { value: 'house', label: 'Nhà riêng' },
    { value: 'room', label: 'Phòng trọ/Phòng đơn' },
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'villa', label: 'Biệt thự' },
];

export default function AddAccommodationForm() {
    const navigate = useNavigate();

    // === STATE ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     
    const [price, setPrice] = useState(0);            
    const [maxGuests, setMaxGuests] = useState(1);    
    const [propertyType, setPropertyType] = useState('apartment'); 
    const [description, setDescription] = useState('');
    const [pictureUrl, setPictureUrl] = useState("");    
    const [latitude, setLatitude] = useState(10.7769);  
    const [longitude, setLongitude] = useState(106.7009); 
    const [searchQuery, setSearchQuery] = useState('');
    
    // UI State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false); 
    const [searchError, setSearchError] = useState("");    
    const [isGenerating, setIsGenerating] = useState(false);

    // --- LOGIC XỬ LÝ (Giữ nguyên logic của bạn) ---

    // AI Generate
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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ title, property_type: propertyType, location, features: description })
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

    // Map Handlers
    const handleLocationSelect = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
    };

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
                } else if (isActive) {
                    setSearchError("Không tìm thấy địa điểm này.");
                }
            } catch (err) {
                setSearchError("Lỗi kết nối định vị.");
            } finally {
                setIsSearching(false);
            }
        }, 1500);

        return () => { isActive = false; clearTimeout(timerId); };
    }, [searchQuery]);
    
    const formatCurrency = (value) => {
        if (!value) return "";
        const number = value.replace(/\D/g, ""); 
        return new Intl.NumberFormat('vi-VN').format(number);
    };

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

        if (!pictureUrl) {
            setError("Vui lòng upload ít nhất 1 hình ảnh.");
            setLoading(false);
            return;
        }

        const payload = {
            title, location, price: parseFloat(price), max_guests: parseInt(maxGuests),
            property_type: propertyType, description: description || null, 
            picture_url: pictureUrl, latitude: parseFloat(latitude), longitude: parseFloat(longitude),
        };

        try {
            const response = await fetch(`${API_URL}/api/owner/accommodations/`, { 
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                setSuccess(`Đăng chỗ ở "${data.title}" thành công!`);
                setTitle(''); setLocation(''); setPrice(0); setMaxGuests(1); setDescription(''); setPictureUrl('');
                window.scrollTo(0, 0);
            } else {
                const detail = data.detail || "Dữ liệu không hợp lệ.";
                setError(`Lỗi (${response.status}): ${JSON.stringify(detail)}`);
                window.scrollTo(0, 0);
            }
        } catch (err) {
            setError("Lỗi kết nối server.");
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
            <div className="max-w-5xl mx-auto">
                <button 
                    onClick={() => navigate('/profile')} 
                    className="flex items-center gap-2 text-gray-500 hover:text-[#AD0000] mb-6 transition-colors font-semibold group"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200 group-hover:border-[#AD0000] transition">
                        <ArrowLeft size={20} />
                    </div>
                    Quay lại danh sách
                </button>
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Thêm chỗ ở mới</h1>
                    <p className="text-gray-500">Điền thông tin chi tiết để đăng tải chỗ ở của bạn lên hệ thống.</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm flex items-center">
                        <span className="mr-2">✅</span> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: THÔNG TIN CƠ BẢN (Card Trắng) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Home className="text-[#AD0000]" size={24}/> Thông tin chung
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên chỗ ở - Full Width */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tên chỗ ở <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Type size={18}/></div>
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                        placeholder="Ví dụ: Căn hộ cao cấp view biển..."
                                    />
                                </div>
                            </div>

                            {/* Loại chỗ ở */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Loại hình</label>
                                <select 
                                    value={propertyType} 
                                    onChange={(e) => setPropertyType(e.target.value)} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none bg-white transition cursor-pointer"
                                >
                                    {MOCK_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                            </div>

                            {/* Số khách */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Số khách tối đa</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Users size={18}/></div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={maxGuests} 
                                        onChange={(e) => setMaxGuests(e.target.value)} 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Giá tiền - Full Width or Half */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Giá thuê mỗi đêm (VNĐ)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">đ</div>
                                    <input 
                                        type="text" 
                                        value={formatCurrency(String(price))} 
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\./g, "");
                                            if (!isNaN(rawValue)) setPrice(rawValue);
                                        }}
                                        required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition font-bold text-lg text-[#AD0000]"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ĐỊA ĐIỂM (Card Trắng - Chia cột rõ ràng) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <MapPin className="text-[#AD0000]" size={24}/> Vị trí & Bản đồ
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cột Trái: Input Địa chỉ & Search */}
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ hiển thị</label>
                                    <textarea 
                                        rows="3"
                                        value={location} 
                                        onChange={(e) => setLocation(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Địa chỉ chính xác sẽ giúp khách dễ dàng tìm thấy.</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                                        <Search size={14}/> Tìm nhanh trên bản đồ
                                    </label>
                                    <input 
                                        type="text" 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 outline-none text-sm"
                                        placeholder="Nhập tên khu vực (VD: Chợ Bến Thành)..."
                                    />
                                    {isSearching && <p className="text-xs text-blue-600 mt-2 animate-pulse">⏳ Đang tìm vị trí...</p>}
                                    {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
                                </div>
                            </div>

                            {/* Cột Phải: Map */}
                            <div className="lg:col-span-2">
                                <div className="rounded-xl overflow-hidden border border-gray-300 h-[300px] lg:h-full relative shadow-inner">
                                    <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs font-bold shadow text-gray-600">
                                        Kéo ghim để chỉnh vị trí
                                    </div>
                                    <LocationPicker 
                                        defaultLat={latitude} 
                                        defaultLng={longitude} 
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-right">Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: HÌNH ẢNH & MÔ TẢ */}
                    <div className="flex flex-col gap-8">
                        {/* Hình ảnh */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ImageIcon className="text-[#AD0000]" size={24}/> Hình ảnh
                            </h2>
                            <ImageUpload 
                                onUploadSuccess={(urlsArray) => setPictureUrl(urlsArray.join(','))} 
                                defaultImages={pictureUrl}
                            />
                            <p className="text-xs text-gray-500 mt-4 italic">*Đăng ít nhất 1 ảnh. Ảnh đầu tiên sẽ là ảnh bìa.</p>
                        </div>

                        {/* Mô tả AI */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="text-[#AD0000]" size={24}/> Mô tả chi tiết
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md transition-all active:scale-95 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'}`}
                                >
                                    {isGenerating ? <span className="animate-spin">⏳</span> : <Sparkles size={16}/>}
                                    {isGenerating ? "AI đang viết..." : "Viết bằng AI"}
                                </button>
                            </div>
                            
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full grow p-4 rounded-xl border focus:ring-1 outline-none resize-none transition text-base leading-relaxed ${isGenerating ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-300 focus:border-[#AD0000] focus:ring-[#AD0000]'}`}
                                placeholder="Nhập các đặc điểm chính (VD: Gần trung tâm, có hồ bơi, yên tĩnh...) rồi bấm nút AI."
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={() => navigate('/profile')}
                            className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-2"
                        >
                            <X size={20}/> Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#AD0000] hover:bg-[#850000]'}`}
                        >
                            {loading ? "Đang lưu..." : <><Save size={20}/> Đăng chỗ ở</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}