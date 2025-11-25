import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- IMPORT COMPONENTS ---
import Navbar from "../components/Navbar";
import ChangePass from "../components/profile/SettingChangePass";
import HotelBookingList from "../components/profile/ReservationHis";
import OwnerDashBoard from "../components/profile/OwnerDashB";
import BookingList from "../components/profile/BookingList";
import ProfileForm from "../components/profile/ProfileForm";
import Notification from "../components/profile/Notification";
import SidebarBtn from "../components/profile/SidebarBtn";

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
    const [role, setRole] = useState(localStorage.getItem("user_role") || "traveler"); 
    
    // Dữ liệu form
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

    // State chỉnh sửa
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    
    const hasAvatar = false;
    const userAvatar = hasAvatar ? OriAvatar : DefaultAvatar;

    const [originalData, setOriginalData] = useState({});

    // --- STATE CHO THÔNG BÁO (NOTIFICATION) ---
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    // Hàm gọi thông báo 
    const showNotify = (message, type = "success") => {
        setNotification({ show: true, message, type });
        // Tự động tắt sau 3 giây
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            const token = localStorage.getItem("access_token");

            if (!token) {
                showNotify("Bạn chưa đăng nhập.", "error");
                setLoading(false);
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
                    const userRole = data.role || "traveler";
                    setRole(userRole);
                    localStorage.setItem("user_role", userRole);

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

                    setID(userData.id);
                    setUsername(userData.username);
                    setFullName(userData.fullName);
                    setEmail(userData.email);
                    setPhone(userData.phone);
                    setSex(userData.sex);
                    setCity(userData.city);
                    setPreference(userData.preference);
                    setDob(userData.dob);

                    setOriginalData(userData);

                } else {
                    showNotify(data.detail || "Lỗi tải thông tin.", "error");
                    if (response.status === 401) navigate("/login");
                }
            } catch (err) {
                showNotify("Lỗi kết nối server.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    // --- XỬ LÝ LƯU (HANDLE SAVE) ---
    const handleSave = async (type) => {
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
                showNotify("Cập nhật thông tin thành công!", "success");
                
                setOriginalData({
                    ...originalData,
                    fullName, email, phone, sex, city, preference, dob
                });
                
                if (type === 'info') setIsEditingInfo(false);
                if (type === 'email') setIsEditingEmail(false);
                if (type === 'phone') setIsEditingPhone(false);

            } else {
                showNotify(data.detail || "Cập nhật thất bại.", "error");
            }
        } catch (err) {
            showNotify("Lỗi kết nối mạng.", "error");
        }
    };

    // --- XỬ LÝ HỦY BỎ ---
    const handleCancel = (type) => {
        if (type === 'info') {
            setFullName(originalData.fullName);
            setSex(originalData.sex);
            setCity(originalData.city);
            setPreference(originalData.preference);
            setDob(originalData.dob);
            setIsEditingInfo(false);
        }
        if (type === 'email') {
            setEmail(originalData.email);
            setIsEditingEmail(false);
        }
        if (type === 'phone') {
            setPhone(originalData.phone);
            setIsEditingPhone(false);
        }
        showNotify("Đã hủy thay đổi", "info");
    };

    

    if (loading) return <div style={{textAlign: 'center', marginTop: 100}}>Đang tải...</div>;

    return (
        <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .sidebar-transition {
                    transition: all 0.3s ease-in-out;
                }
            `}</style>
            
            <Notification 
                show={notification.show} 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ ...notification, show: false })}
            />

            <Navbar />
            <div className="fixed bottom-0 left-0 w-full z-0 overflow-hidden pointer-events-none">
                <img 
                    src={Profilebg} 
                    alt="bg" 
                    className="w-full object-cover translate-y-1/4 opacity-80" 
                />
                <img 
                    src={Secprofilebg} 
                    alt="bg2" 
                    className="absolute bottom-0 left-0 w-full object-cover translate-y-1/3 opacity-60" 
                />
            </div>

            <div style={{ width: 1440, margin: "0 auto", position: "relative", minHeight: "calc(100vh - 75px)", background: "white", borderRadius: 12, zIndex: 1 }}>
                
                {/* Sidebar */}
                <div style={{ width: 463, height: 538, position: "relative", top: 100, left: 18, background: "#AD0000", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img src={TravellerProfilebg} alt="bg-profile" style={{zIndex: 0}}/>
                    <div style={{ position: "absolute", top: 27, width: 120, height: 120, borderRadius: "50%", background: "white", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
                        <img src={userAvatar} alt="Avatar" style={{ width: 117, height: 117, borderRadius: "50%", objectFit: "cover" }} />
                    </div>
                    <h1 style={{ position: "absolute", top: 162, fontSize: 25, fontWeight: "700", color: "white" }}>{userName}</h1>
                    <div style={{ position: "absolute", height: '1px', backgroundColor: 'white', width: '100%', bottom: 319 }}/>

                    <div style={{ position: 'absolute', top: 230, left: 0, width: '100%', paddingLeft: 25, display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                {/* Content */}
                <div style={{ width: 923, minHeight: 538, height: "fit-content", position: "absolute", top: 100, right: 23, background: "white", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: '0px 4px 10px rgba(0,0,0,0.25)', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: 36, fontWeight: '700', color: '#AD0000', position: 'absolute', left: 19, top: 10 }}>
                        {activeSection === "history" && "Chỗ đã đặt"}
                        {activeSection === "bookCalen" && "Lịch đặt phòng"}
                        {activeSection === "setting" && "Riêng tư và bảo mật"}
                    </h1>

                    <div style={{ marginTop: 60, width: '100%', position: 'relative' }}>
                        <div key={activeSection} className="animate-fade-in-up">
                        {activeSection === "info" && (
                            <ProfileForm 
                                // Truyền Data
                                userName={userName} ID={ID} role={role}
                                fullName={fullName} setFullName={setFullName}
                                sex={sex} setSex={setSex}
                                dob={dob} setDob={setDob}
                                city={city} setCity={setCity}
                                preference={preference} setPreference={setPreference}
                                email={email} setEmail={setEmail}
                                phone={phone} setPhone={setPhone}

                                // Truyền State Edit
                                isEditingInfo={isEditingInfo} setIsEditingInfo={setIsEditingInfo}
                                isEditingEmail={isEditingEmail} setIsEditingEmail={setIsEditingEmail}
                                isEditingPhone={isEditingPhone} setIsEditingPhone={setIsEditingPhone}

                                // Truyền Hàm xử lý
                                handleSave={handleSave}
                                handleCancel={handleCancel}
                            />
                        )}                        
                        {activeSection === "history" && role === "traveler" && <HotelBookingList />}
                        {activeSection === "statusPost" && role === "traveler" && <div>(Component Lịch sử đăng bài đang phát triển)</div>}
                        {activeSection === "accoList" && role === "owner" && <OwnerDashBoard />}
                        {activeSection === "bookCalen" && role === "owner" && <BookingList />}
                        {activeSection === "setting" && <ChangePass />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
