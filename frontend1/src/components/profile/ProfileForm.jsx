import React from "react";

// Component con ContactSection (Giữ nguyên logic, chỉnh lại style một chút cho mượt)
const ContactSection = ({ title, subtitle, value, isEditing, onStartEdit, onSave, onCancel, onChange, isPhone }) => (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="flex justify-between items-start md:items-center mb-2">
            <div>
                <h3 className="m-0 text-lg font-bold text-gray-800">{title}</h3>
                <p className="m-0 text-gray-500 text-sm mt-1">{subtitle}</p>
            </div>
            {!isEditing ? (
                 <button onClick={onStartEdit} className="shrink-0 bg-white border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm hover:bg-gray-100 transition shadow-sm">
                    {isPhone ? "Thêm/Sửa SĐT" : "Thay đổi"}
                </button>
            ) : (
                <div className="flex gap-2 shrink-0">
                     <button onClick={onSave} className="bg-[#AD0000] text-white border-none rounded-lg px-4 py-2 font-bold text-sm hover:bg-[#850000] transition shadow-md">
                        Lưu
                    </button>
                    <button onClick={onCancel} className="bg-white text-gray-600 border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm hover:bg-gray-50 transition">
                        Hủy
                    </button>
                </div>
            )}
        </div>
        
        {/* Phần hiển thị giá trị */}
        {isEditing ? (
             <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="mt-2 w-full p-3 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-[#AD0000] outline-none bg-white"
                autoFocus
             />
        ) : (
             <div className="mt-2 text-base font-bold text-gray-900 break-all">
                 {value || <span className="text-gray-400 font-normal italic">(Chưa cập nhật)</span>}
             </div>
        )}
    </div>
);

export default function ProfileForm({
    userName, ID, role,
    fullName, setFullName,
    sex, setSex,
    dob, setDob,
    city, setCity,
    preference, setPreference,
    email, setEmail,
    phone, setPhone,
    isEditingInfo, setIsEditingInfo,
    isEditingEmail, setIsEditingEmail,
    isEditingPhone, setIsEditingPhone,
    handleSave, handleCancel
}) {
    return (
        <div className="w-full h-auto px-6 md:px-10 pb-10 pt-2 relative -mt-[55px]">
            
            {/* --- HEADER SECTION (Giống OwnerDashB) --- */}
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Thông tin cá nhân</h1>
            </div>

            {/* --- FORM CONTENT --- */}
            <div className="flex flex-col gap-6">
                
                {/* Hàng 1: Read-only info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex flex-col gap-2">
                        <label className="text-blue-800 font-bold text-sm uppercase tracking-wider">Tên Đăng Nhập</label>
                        <div className="font-bold text-gray-700 text-lg">{userName}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-blue-800 font-bold text-sm uppercase tracking-wider">ID Người dùng</label>
                        <div className="font-bold text-gray-700 text-lg">#{ID}</div>
                    </div>
                </div>

                {/* Hàng 2: Họ tên */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-bold text-sm">Họ và tên</label>
                    <input 
                        type="text" value={fullName} disabled={!isEditingInfo} onChange={(e) => setFullName(e.target.value)} 
                        className={`w-full p-3 rounded-xl font-bold text-gray-800 outline-none transition-all ${isEditingInfo ? 'bg-white border border-[#AD0000] ring-1 ring-[#AD0000] shadow-sm' : 'bg-gray-100 border-transparent'}`} 
                    />
                </div>

                {/* Hàng 3: Grid 3 cột */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3 flex flex-col gap-2">
                        <label className="text-gray-700 font-bold text-sm">Giới tính</label>
                        <select value={sex} disabled={!isEditingInfo} onChange={(e) => setSex(e.target.value)} className={`w-full p-3 rounded-xl font-bold outline-none ${isEditingInfo ? 'bg-white border border-gray-300 shadow-sm' : 'bg-gray-100'}`}>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="undisclosed">Khác</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex flex-col gap-2">
                        <label className="text-gray-700 font-bold text-sm">Vai trò</label>
                        <div className="w-full bg-gray-100 p-3 rounded-xl font-bold text-gray-500">{role === "owner" ? "Cho thuê" : "Người thuê"}</div>
                    </div>
                    <div className="md:col-span-6 flex flex-col gap-2">
                        <label className="text-gray-700 font-bold text-sm">Ngày sinh</label>
                        <div className="flex gap-2">
                             <select value={dob.day} disabled={!isEditingInfo} onChange={(e) => setDob({...dob, day: e.target.value})} className={`flex-1 p-3 rounded-xl font-bold outline-none ${isEditingInfo ? 'bg-white border border-gray-300 shadow-sm' : 'bg-gray-100'}`}>
                                {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                            <select value={dob.month} disabled={!isEditingInfo} onChange={(e) => setDob({...dob, month: e.target.value})} className={`flex-1 p-3 rounded-xl font-bold outline-none ${isEditingInfo ? 'bg-white border border-gray-300 shadow-sm' : 'bg-gray-100'}`}>
                                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                            </select>
                            <select value={dob.year} disabled={!isEditingInfo} onChange={(e) => setDob({...dob, year: e.target.value})} className={`flex-1 p-3 rounded-xl font-bold outline-none ${isEditingInfo ? 'bg-white border border-gray-300 shadow-sm' : 'bg-gray-100'}`}>
                                {[...Array(100)].map((_, i) => <option key={i} value={2025-i}>{2025-i}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Hàng 4: Thành phố */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-bold text-sm">Thành phố cư trú</label>
                    <input type="text" value={city} disabled={!isEditingInfo} onChange={(e) => setCity(e.target.value)} className={`w-full p-3 rounded-xl font-bold text-gray-800 outline-none ${isEditingInfo ? 'bg-white border border-[#AD0000] ring-1 ring-[#AD0000] shadow-sm' : 'bg-gray-100'}`} />
                </div>

                {/* Hàng 5: Sở thích */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-bold text-sm">Sở thích cá nhân</label>
                    <textarea value={preference} disabled={!isEditingInfo} onChange={(e) => setPreference(e.target.value)} className={`w-full p-3 rounded-xl font-bold text-gray-800 outline-none resize-none h-32 ${isEditingInfo ? 'bg-white border border-[#AD0000] ring-1 ring-[#AD0000] shadow-sm' : 'bg-gray-100'}`} />
                </div>

                {/* Nút lưu / chỉnh sửa */}
                <div className="flex justify-end pt-2">
                    {isEditingInfo ? (
                        <div className="flex gap-3">
                             <button onClick={() => handleCancel('info')} className="px-6 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                             <button onClick={() => handleSave('info')} className="px-6 py-2.5 rounded-xl bg-[#AD0000] font-bold text-white hover:bg-[#850000] shadow-md transition transform active:scale-95">Lưu thay đổi</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingInfo(true)} className="px-6 py-2.5 rounded-xl border-2 border-[#AD0000] font-bold text-[#AD0000] hover:bg-red-50 transition">Chỉnh sửa thông tin</button>
                    )}
                </div>

                {/* --- PHẦN LIÊN HỆ (Tách biệt bằng đường kẻ mờ) --- */}
                <div className="border-t-2 border-dashed border-gray-100 pt-8 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContactSection 
                        title="Email" 
                        subtitle="Email liên kết bảo mật" 
                        value={email} 
                        isEditing={isEditingEmail}
                        onStartEdit={() => setIsEditingEmail(true)}
                        onSave={() => handleSave('email')}
                        onCancel={() => handleCancel('email')}
                        onChange={setEmail} 
                    />
                    <ContactSection 
                        title="Số điện thoại" 
                        subtitle="Dùng để liên hệ nhanh" 
                        value={phone} 
                        isEditing={isEditingPhone}
                        onStartEdit={() => setIsEditingPhone(true)}
                        onSave={() => handleSave('phone')}
                        onCancel={() => handleCancel('phone')}
                        onChange={setPhone} 
                        isPhone={true}
                    />
                </div>
            </div>
        </div>
    );
}