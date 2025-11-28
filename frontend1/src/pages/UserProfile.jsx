import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// --- IMPORT COMPONENTS ---
import Navbar from "../components/Navbar";
import ChangePass from "../components/profile/SettingChangePass";
// Import các component con riêng biệt
import HotelBookingList from "../components/profile/ReservationHis"; // Dành cho Traveller
import OwnerDashBoard from "../components/profile/OwnerDashB";       // Dành cho Owner
import BookingList from "../components/profile/BookingList";         // Lịch booking dành cho Owner

// --- IMPORT IMAGES ---
import TravellerProfilebg from "../images/ProfileAvaterbg.png";
import OriAvatar from "../images/OriAvatar.png";
import DefaultAvatar from "../images/avatar-default.svg";
import Profilebg from "../images/profilebg.svg";
import Secprofilebg from "../images/2ndprofilebg.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function UserProfile() {
    const navigate = useNavigate();
    
    // --- STATE QUẢN LÝ DỮ LIỆU USER ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Role: Mặc định lấy từ localStorage, sau đó cập nhật chính xác từ API
    const [role, setRole] = useState(localStorage.getItem("user_role") || "traveler"); 
    
    const [ID, setID] = useState("");
    const [userName, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [sex, setSex] = useState("nam");
    const [dob, setDob] = useState({ day: "1", month: "1", year: "2000" });
    const [city, setCity] = useState("");
    const [preference, setPreference] = useState("");
    
    // State giao diện
    const [activeSection, setActiveSection] = useState("info");
    const [isEditing, setIsEditing] = useState(false);
    
    // Avatar
    const hasAvatar = false;
    const userAvatar = hasAvatar ? OriAvatar : DefaultAvatar;

    // State lưu giá trị gốc (để chức năng Hủy hoạt động)
    const [originalData, setOriginalData] = useState({});

    // --- 1. FETCH DATA TỪ API ---
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            const token = localStorage.getItem("access_token");

            if (!token) {
                setError("Bạn chưa đăng nhập.");
                setLoading(false);
                // navigate("/login"); // Uncomment nếu muốn redirect
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    // Cập nhật Role chuẩn từ DB
                    const userRole = data.role || "traveler";
                    setRole(userRole);
                    localStorage.setItem("user_role", userRole); // Đồng bộ lại localStorage

                    // Helper tách ngày sinh
                    let d = "1", m = "1", y = "2000";
                    if (data.dob) {
                        const dateObj = new Date(data.dob);
                        d = dateObj.getUTCDate().toString();
                        m = (dateObj.getUTCMonth() + 1).toString();
                        y = dateObj.getUTCFullYear().toString();
                    }

                    const userData = {
                        id: data.id || "",
                        username: data.username || "",
                        fullName: data.full_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        sex: data.sex || "nam",
                        city: data.city || "",
                        preference: data.preference || "",
                        dob: { day: d, month: m, year: y }
                    };

                    // Set State hiển thị
                    setID(userData.id);
                    setUsername(userData.username);
                    setFullName(userData.fullName);
                    setEmail(userData.email);
                    setPhone(userData.phone);
                    setSex(userData.sex);
                    setCity(userData.city);
                    setPreference(userData.preference);
                    setDob(userData.dob);

                    // Set State gốc (để restore khi hủy)
                    setOriginalData(userData);

                } else {
                    setError(data.detail || "Lỗi tải thông tin.");
                    if (response.status === 401) navigate("/login");
                }
            } catch (err) {
                setError("Lỗi kết nối server.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    // --- 2. XỬ LÝ CẬP NHẬT (HANDLE SAVE) ---
    const handleSave = async () => {
        const token = localStorage.getItem("access_token");
        const formattedMonth = String(dob.month).padStart(2, '0');
        const formattedDay = String(dob.day).padStart(2, '0');
        const dobString = `${dob.year}-${formattedMonth}-${formattedDay}`;

        const payload = {
            full_name: fullName,
            email: email,
            phone: phone,
            sex: sex,
            city: city,
            preference: preference,
            dob: dobString
        };

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();

            if (response.ok) {
                alert("Cập nhật thành công!");
                // Cập nhật lại dữ liệu gốc sau khi lưu thành công
                setOriginalData({
                    ...originalData,
                    fullName, email, phone, sex, city, preference, dob
                });
                setIsEditing(false);
            } else {
                alert(data.detail || "Cập nhật thất bại.");
            }
        } catch (err) {
            alert("Lỗi kết nối.");
        }
    };

    // --- 3. XỬ LÝ HỦY BỎ ---
    const handleCancel = () => {
        setFullName(originalData.fullName);
        setEmail(originalData.email);
        setPhone(originalData.phone);
        setSex(originalData.sex);
        setCity(originalData.city);
        setPreference(originalData.preference);
        setDob(originalData.dob);
        setIsEditing(false);
    };

    // --- 4. RENDER GIAO DIỆN FORM (Tái sử dụng code cũ) ---
    const renderProfileForm = () => (
        <div style={{ position: 'absolute', width: 867, height: 760, background: 'white', borderRadius: 20, border: '1px #878787 solid', top: 55, left: 28 }}>
            {/* Các trường Input giống hệt code cũ */}
            <div>
                <label style={labelStyle}>Tên Đăng Nhập</label>
                <input type="text" value={userName} disabled style={{...inputStyle, backgroundColor: '#f0f0f0', width: '391px'}} />
            </div>
            <div>
                <label style={{...labelStyle, left: 445}}>ID người dùng</label>
                <div style={{...inputStyle, left: 445, width: '391px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', color: '#878787'}}>{ID}</div>
            </div>
            <div>
                <label style={{...labelStyle, top: 108}}>Họ và tên</label>
                <input type="text" value={fullName} disabled={!isEditing} onChange={(e) => setFullName(e.target.value)} style={{...inputStyle, top: 142, width: '805px', backgroundColor: isEditing ? 'white' : '#f0f0f0', border: isEditing ? '1px solid #ccc' : 'none'}} />
            </div>

            {/* Giới tính - Vai trò - Ngày sinh */}
            <div>
                <label style={{...labelStyle, top: 206}}>Giới tính</label>
                <select value={sex} disabled={!isEditing} onChange={(e) => setSex(e.target.value)} style={{...inputStyle, top: 239, width: '122px', backgroundColor: isEditing ? 'white' : '#f0f0f0'}}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="undisclosed">Khác</option>
                </select>
            </div>
            <div>
                <label style={{...labelStyle, top: 206, left: 187}}>Vai trò</label>
                <div style={{...inputStyle, top: 239, left: 187, width: '148px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', color: '#878787'}}>
                    {role === "owner" ? "Cho thuê" : "Người thuê"}
                </div>
            </div>
            <div>
                <label style={{...labelStyle, top: 206, left: 377}}>Ngày sinh</label>
                <div style={{position: 'absolute', top: 239, left: 377, display: 'flex', gap: 15}}>
                    <select value={dob.day} disabled={!isEditing} onChange={(e) => setDob({...dob, day: e.target.value})} style={{...miniSelectStyle, backgroundColor: isEditing ? 'white' : '#f0f0f0'}}>
                        {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select value={dob.month} disabled={!isEditing} onChange={(e) => setDob({...dob, month: e.target.value})} style={{...miniSelectStyle, backgroundColor: isEditing ? 'white' : '#f0f0f0'}}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                    </select>
                    <select value={dob.year} disabled={!isEditing} onChange={(e) => setDob({...dob, year: e.target.value})} style={{...miniSelectStyle, width: 185, backgroundColor: isEditing ? 'white' : '#f0f0f0'}}>
                        {[...Array(100)].map((_, i) => <option key={i} value={2025-i}>{2025-i}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label style={{...labelStyle, top: 300}}>Thành phố cư trú</label>
                <input type="text" value={city} disabled={!isEditing} onChange={(e) => setCity(e.target.value)} style={{...inputStyle, top: 336, width: '805px', backgroundColor: isEditing ? 'white' : '#f0f0f0', border: isEditing ? '1px solid #ccc' : 'none'}} />
            </div>

            <div>
                <label style={{...labelStyle, top: 400}}>Sở thích cá nhân</label>
                <textarea value={preference} disabled={!isEditing} onChange={(e) => setPreference(e.target.value)} style={{...inputStyle, top: 433, width: '805px', height: 211, backgroundColor: isEditing ? 'white' : '#f0f0f0', border: isEditing ? '1px solid #ccc' : 'none', resize: 'none', fontFamily: 'Montserrat', padding: 10}} />
            </div>

            {/* Nút bấm */}
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={{...buttonStyle, backgroundColor: isEditing ? 'white' : '#AD0000', color: isEditing ? '#AD0000' : 'white', border: isEditing ? 'none' : 'none'}}>
               {isEditing ? "Lưu chỉnh sửa" : "Chỉnh sửa thông tin"}
            </button>
            
            {isEditing && (
                <button onClick={handleCancel} style={{...buttonStyle, left: 475, width: 100, backgroundColor: 'white', color: '#555', border: '1px solid #878787'}}>Hủy</button>
            )}

            {/* Email & Phone Section (giữ nguyên logic) */}
            <div style={{position: 'absolute', top: 780, width: 867}}>
                <ContactSection title="Email đã liên kết" subtitle="Mỗi tài khoản chỉ liên kết 1 email" value={email} onEdit={() => setIsEditing(true)} isEditing={isEditing} onChange={setEmail} />
                <div style={{height: 20}} />
                <ContactSection title="Số di động" subtitle="Mỗi tài khoản chỉ thêm tối đa 1 số" value={phone} onEdit={() => {const p = prompt("Nhập SĐT:"); if(p) setPhone(p)}} isEditing={false} isPhone={true} />
            </div>
        </div>
    );

    // --- RENDER CHÍNH ---
    if (loading) return <div style={{textAlign: 'center', marginTop: 100}}>Đang tải...</div>;
    const location = useLocation();

    useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section === "booking") setActiveSection("booking");
    if (section === "history") setActiveSection("history");
    }, [location]);


    return (
        <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
            <Navbar />
            {/* Background Images */}
            <div style={{ position: "absolute", top: 0, width: "100%", zIndex: 0, height: "1050px", overflow: "hidden"}}>
                <img src={Profilebg} alt="bg" style={{width: "100%", position: "absolute", bottom: -300}} />
                <img src={Secprofilebg} alt="bg2" style={{width: "100%", position: "absolute", bottom: -300}} />
            </div>

            <div style={{ width: 1440, margin: "0 auto", position: "relative", minHeight: "calc(100vh - 75px)", background: "white", borderRadius: 12, zIndex: 1 }}>
                
                {/* --- SIDEBAR (MENU TRÁI) --- */}
                <div style={{ width: 463, height: 538, position: "relative", top: 100, left: 18, background: "#AD0000", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img src={TravellerProfilebg} alt="bg-profile" style={{zIndex: 0}}/>
                    <div style={{ position: "absolute", top: 27, width: 120, height: 120, borderRadius: "50%", background: "white", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
                        <img src={userAvatar} alt="Avatar" style={{ width: 117, height: 117, borderRadius: "50%", objectFit: "cover" }} />
                    </div>
                    <h1 style={{ position: "absolute", top: 162, fontSize: 25, fontWeight: "700", color: "white" }}>{userName}</h1>
                    <div style={{ position: "absolute", height: '1px', backgroundColor: 'white', width: '100%', bottom: 319 }}/>

                    {/* MENU BUTTONS ĐỘNG */}
                    <div style=
                    {{ 
                        position: 'absolute',
                        top: 230,             // <--- Cách đỉnh khung đỏ 230px (ngay dưới đường kẻ)
                        left: 0,
                        width: '100%', 
                        paddingLeft: 25,
                        display: 'flex',      // Dùng flex để xếp dọc các nút
                        flexDirection: 'column',
                        gap: '10px'           
                    }}
                    >
                        <SidebarBtn label="Thông tin cá nhân" active={activeSection === "info"} onClick={() => setActiveSection("info")} />
                        
                        {role === "traveler" ? (
                            <>
                                <SidebarBtn label="Chỗ đã đặt" active={activeSection === "history"} onClick={() => setActiveSection("history")} />
                                <SidebarBtn label="Lịch sử đăng bài" active={activeSection === "statusPost"} onClick={() => setActiveSection("statusPost")} />
                            </>
                        ) : (
                            <>
                                <SidebarBtn label="Danh sách chỗ ở" active={activeSection === "accoList"} onClick={() => setActiveSection("accoList")} />
                                <SidebarBtn label="Lịch đặt phòng" active={activeSection === "bookCalen"} onClick={() => setActiveSection("bookCalen")} />
                            </>
                        )}

                        <SidebarBtn label="Riêng tư và bảo mật" active={activeSection === "setting"} onClick={() => setActiveSection("setting")} />
                    </div>
                </div>

                {/* --- CONTENT (NỘI DUNG PHẢI) --- */}
                <div style={{ width: 923, minHeight: 1200, position: "absolute", top: 100, right: 23, background: "white", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: '0px 4px 10px rgba(0,0,0,0.25)', paddingBottom: 40 }}>
                    
                    <h1 style={{ fontSize: 24, fontWeight: '700', color: '#AD0000', position: 'absolute', left: 19, top: 10 }}>
                        {activeSection === "info" && "Thông tin cá nhân"}
                        {activeSection === "history" && "Chỗ đã đặt"}
                        {activeSection === "accoList" && "Danh sách chỗ ở"}
                        {activeSection === "bookCalen" && "Lịch đặt phòng"}
                        {activeSection === "setting" && "Riêng tư và bảo mật"}
                    </h1>

                    <div style={{ marginTop: 60, width: '100%', position: 'relative' }}>
                        {activeSection === "info" && renderProfileForm()}
                        
                        {/* Logic hiển thị dựa trên Role */}
                        {activeSection === "history" && role === "traveler" && <HotelBookingList />}
                        {activeSection === "statusPost" && role === "traveler" && <div>(Component Lịch sử đăng bài đang phát triển)</div>}
                        
                        {activeSection === "accoList" && role === "owner" && <OwnerDashBoard />}
                        {activeSection === "bookCalen" && role === "owner" && <BookingList />}
                        
                        {activeSection === "setting" && <ChangePass />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- CÁC SUB-COMPONENT NHỎ ĐỂ CODE GỌN HƠN ---

const SidebarBtn = ({ label, active, onClick }) => (
    <div style={{ position: 'relative', height: 55 }}>
        {active && <div style={{ position: 'absolute', left: -10, width: 420, height: 55, background: 'rgba(255,255,255,0.95)', borderRadius: 10 }} />}
        <button onClick={onClick} style={{ position: 'absolute', left: 0, top: 10, fontSize: 24, fontWeight: '700', color: active ? '#AD0000' : 'white', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat' }}>
            {label}
        </button>
    </div>
);

const ContactSection = ({ title, subtitle, value, onEdit, isEditing, onChange, isPhone }) => (
    <div style={{ border: '1px solid #878787', borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
                <p style={{ margin: 0, color: "#999", fontSize: 14 }}>{subtitle}</p>
            </div>
            <button onClick={onEdit} style={{ border: "1px solid black", background: "white", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>
                {isPhone ? "Thêm/Sửa SĐT" : "Thay đổi"}
            </button>
        </div>
        {(!isPhone || value) && (
             isEditing && !isPhone ? 
             <input type="text" value={value} onChange={(e)=>onChange(e.target.value)} style={{marginTop: 10, width: '100%', padding: 5}}/> :
             <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #878787', fontSize: 16, fontWeight: 700 }}>{value}</div>
        )}
    </div>
);

// CSS Styles object (để đỡ lặp lại trong JSX)
const labelStyle = { position: 'absolute', left: 31, top: 11, color: '#878787', fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat' };
const inputStyle = { position: 'absolute', left: 31, top: 45, height: 42, borderRadius: 10, padding: 5, fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat' };
const miniSelectStyle = { borderRadius: 10, width: 122, padding: 5, fontSize: 20, fontWeight: '700', fontFamily: 'Montserrat' };
const buttonStyle = { position: 'absolute', top: 680, left: 588, width: 248, height: 46, borderRadius: 10, fontSize: 20, fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat' };