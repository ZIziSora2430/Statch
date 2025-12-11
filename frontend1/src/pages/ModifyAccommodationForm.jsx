import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUpload from '../components/CloudinaryUpload.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import { geocodeAddress } from '../utils/geocoding.js';

// Import Icons (Cài đặt: npm install lucide-react)
import { MapPin, Users, Home, Type, FileText, Search, Sparkles, Image as ImageIcon, Save, X, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MOCK_TYPES = [
    { value: 'apartment', label: 'Căn hộ dịch vụ' },
    { value: 'house', label: 'Nhà riêng' },
    { value: 'room', label: 'Phòng trọ/Phòng đơn' },
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'villa', label: 'Biệt thự' },
];

export default function ModifyAccommodationForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const accommodationId = id;

    // === STATE ===
    const [title, setTitle] = useState('');           
    const [location, setLocation] = useState('');     
    const [price, setPrice] = useState(0);            
    const [maxGuests, setMaxGuests] = useState(1);    
    const [propertyType, setPropertyType] = useState('hotel'); 
    const [description, setDescription] = useState('');
    const [pictureUrl, setPictureUrl] = useState(""); 
    
    const [latitude, setLatitude] = useState(null);  
    const [longitude, setLongitude] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // Trạng thái tải dữ liệu ban đầu
    const [isSearching, setIsSearching] = useState(false);     
    const [searchError, setSearchError] = useState("");        
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
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTitle(data.title || '');
                    setLocation(data.location || '');
                    setPrice(parseInt(data.price) || 0);
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

    // --- LOGIC XỬ LÝ (Giữ nguyên) ---
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

    const handleAIGenerate = async () => {
        if (!description || description.trim().length < 5) {
            alert("Vui lòng nhập vài từ khóa mô tả trước."); return;
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
            if (response.ok && data.generated_description) setDescription(data.generated_description);
            else alert(data.generated_description || "Lỗi AI");
        } catch (err) { alert("Lỗi kết nối AI"); } 
        finally { setIsGenerating(false); }
    };

    const formatCurrency = (value) => {
        if (!value) return "";
        const number = value.replace(/\D/g, ""); 
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);

        const token = localStorage.getItem("access_token");
        if (!token) { setError("Vui lòng đăng nhập lại."); setLoading(false); return; }

        const payload = {
            title, location, price: parseFloat(price), max_guests: parseInt(maxGuests),
            property_type: propertyType, description: description || null, 
            picture_url: pictureUrl || null, latitude, longitude,
        };

        try {
            const response = await fetch(`${API_URL}/api/owner/accommodations/${accommodationId}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                setSuccess(`Cập nhật thành công!`);
                window.scrollTo(0, 0);
            } else {
                setError(`Lỗi: ${JSON.stringify(data.detail)}`);
                window.scrollTo(0, 0);
            }
        } catch (err) { setError("Lỗi kết nối server."); window.scrollTo(0, 0); } 
        finally { setLoading(false); }
    };

    // --- RENDER LOADING STATE ---
    if (fetching) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-[#AD0000] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải thông tin chỗ ở...</p>
        </div>
    );

    // --- RENDER MAIN FORM ---
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

                {/* Header Title */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Chỉnh sửa chỗ ở</h1>
                        <p className="text-gray-500">Cập nhật thông tin chi tiết cho địa điểm này.</p>
                    </div>
                    <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-mono">ID: {accommodationId}</div>
                </div>

                {/* Alerts */}
                {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm flex items-center"><span className="mr-2">⚠️</span> {error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm flex items-center"><span className="mr-2">✅</span> {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: THÔNG TIN CƠ BẢN */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Home className="text-[#AD0000]" size={24}/> Thông tin chung
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên chỗ ở */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tên chỗ ở <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Type size={18}/></div>
                                    <input 
                                        type="text" value={title} onChange={(e) => setTitle(e.target.value)} required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Loại chỗ ở */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Loại hình</label>
                                <select 
                                    value={propertyType} onChange={(e) => setPropertyType(e.target.value)} 
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
                                        type="number" min="1" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Giá tiền */}
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
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: VỊ TRÍ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <MapPin className="text-[#AD0000]" size={24}/> Vị trí & Bản đồ
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ hiển thị</label>
                                    <textarea 
                                        rows="3" value={location} onChange={(e) => setLocation(e.target.value)} required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#AD0000] focus:ring-1 focus:ring-[#AD0000] outline-none transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Nên ghi rõ số nhà, tên đường, phường, quận.</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <label className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                                        <Search size={14}/> Tìm vị trí mới
                                    </label>
                                    <input 
                                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 outline-none text-sm"
                                        placeholder="Gõ tên khu vực..."
                                    />
                                    {isSearching && <p className="text-xs text-blue-600 mt-2 animate-pulse">⏳ Đang tìm...</p>}
                                    {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="rounded-xl overflow-hidden border border-gray-300 h-[300px] lg:h-full relative shadow-inner">
                                    {latitude && longitude ? (
                                        <LocationPicker 
                                            defaultLat={parseFloat(latitude)} 
                                            defaultLng={parseFloat(longitude)} 
                                            onLocationSelect={handleLocationSelect}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Chưa có tọa độ</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: HÌNH ẢNH & MÔ TẢ */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ImageIcon className="text-[#AD0000]" size={24}/> Hình ảnh
                            </h2>
                            <ImageUpload 
                                onUploadSuccess={(urlsArray) => setPictureUrl(urlsArray.join(','))} 
                                defaultImages={pictureUrl}
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="text-[#AD0000]" size={24}/> Mô tả chi tiết
                                </h2>
                                <button
                                    type="button" onClick={handleAIGenerate} disabled={isGenerating}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md transition-all active:scale-95 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'}`}
                                >
                                    {isGenerating ? <span className="animate-spin">⏳</span> : <Sparkles size={16}/>}
                                    {isGenerating ? "AI đang viết..." : "Viết bằng AI"}
                                </button>
                            </div>
                            <textarea 
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                className={`w-full grow p-4 rounded-xl border focus:ring-1 outline-none resize-none transition text-base leading-relaxed ${isGenerating ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-300 focus:border-[#AD0000] focus:ring-[#AD0000]'}`}
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button 
                            type="button" onClick={() => navigate('/profile')}
                            className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-2"
                        >
                            <X size={20}/> Hủy bỏ
                        </button>
                        <button 
                            type="submit" disabled={loading}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#AD0000] hover:bg-[#850000]'}`}
                        >
                            {loading ? "Đang lưu..." : <><Save size={20}/> Lưu thay đổi</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}