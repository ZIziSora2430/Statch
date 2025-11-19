import Navbar from "../components/Navbar";
import TravellerProfilebg from "../images/ProfileAvaterbg.png"
import OriAvatar from "../images/OriAvatar.png"
import DefaultAvatar from "../images/avatar-default.svg"
import { useState, useEffect } from "react";
import Profilebg from "../images/profilebg.svg"
import Secprofilebg from "../images/2ndprofilebg.svg"
import ChangePass from "../components/SettingChangePass"
import OwnerDashBoard from "../components/OwnerDashB"
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function TravellerProfile() {
    const hasAvatar = false;
    const userAvatar = hasAvatar ? OriAvatar : DefaultAvatar; // Avatar placeholer helper
   
    // State cho loading và error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Hook điều hướng

    // === CẬP NHẬT STATE: Đổi giá trị mock data thành chuỗi rỗng ===
    const [ID, setID] = useState(""); // Sẽ lấy từ data.id (nếu có)
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUsername] = useState("")  // Sẽ lấy từ API
    const [fullName, setFullName] = useState(""); // Sẽ lấy từ API
    const [activeSection, setActiveSection] = useState("info"); // ✅ SỬA: Bắt đầu ở tab "info"
    const isOwner = true; // TODO: Cái này nên lấy từ localStorage.getItem("user_role")
    const role = isOwner ? "Cho thuê" : "Người thuê";


    const [sex, setSex] = useState("nam")
    const [day, setDay] = useState("1");
    const [month, setMonth] = useState("1");
    const [year, setYear] = useState("2000");
    const [city, setCity] = useState("DATA TU USER")
    const [preference, setPreference] = useState("Hãy ghi sở thích cá nhân của bạn ở đây...");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError("");
            
            // 1. Lấy token từ localStorage
            const token = localStorage.getItem("access_token");

            if (!token) {
              setError("Bạn chưa đăng nhập.");
              setLoading(false);
              navigate("/"); // Chuyển về trang đăng nhập nếu không có token
              return;
            }

            try {
              // 2. Gọi API để lấy thông tin user
              // Dựa trên service.py, endpoint này có thể là /users/me
              const response = await fetch(`${API_URL}/users/me`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}` // Gửi token để xác thực
                },
              });

              const data = await response.json();

              if (response.ok) {
                // 3. Cập nhật state với dữ liệu thật
                // Dựa trên service.py, chúng ta có:
                setUsername(data.username || ""); 
                setFullName(data.full_name || ""); // service.py có 'full_name'
                setEmail(data.email || "");       // service.py có 'email'
                setID(data.id || "");             // service.py có 'id' (thường là số)

                setPhone(data.phone || "");
                setSex(data.sex || "nam"); // 'nam' là giá trị default
                setCity(data.city || "");
                setPreference(data.preference || "");

                // Xử lý DOB (Date of Birth)
                if (data.dob) {
                    // data.dob sẽ là "YYYY-MM-DD"
                    // Dùng getUTCDate để tránh lỗi timezone
                    const dobDate = new Date(data.dob); 
                    const apiDay = dobDate.getUTCDate();
                    const apiMonth = dobDate.getUTCMonth() + 1; // JS tháng từ 0-11
                    const apiYear = dobDate.getUTCFullYear();
                    
                    setDay(apiDay);
                    setMonth(apiMonth);
                    setYear(apiYear);

                    // Lưu giá trị gốc
                    setOriginalDay(apiDay);
                    setOriginalMonth(apiMonth);
                    setOriginalYear(apiYear);
                } 
            }   
            
            else {
                setError(data.detail || "Không thể tải thông tin cá nhân.");
                if (response.status === 401) {
                    navigate("/"); // Token hết hạn hoặc không hợp lệ
                }
              }
            } catch (err) {
              setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
              console.error("Fetch profile error:", err);
            } finally {
              setLoading(false);
            }
          };

          fetchProfileData();
    }, [navigate]); // Thêm navigate vào dependency array

    //  Hàm xử lý khi nhấn nút "Lưu chỉnh sửa"
    const handleSave = async () => {
        setError("");
        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Lỗi xác thực. Vui lòng đăng nhập lại.");
            return;
        }
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dobString = `${year}-${formattedMonth}-${formattedDay}`;

        // Dựa trên service.py, hàm update_user chỉ nhận full_name và email
        const payload = {
            full_name: fullName,
            email: email,
            phone: phone,         
            sex: sex,          
            city: city,           
            preference: preference,
            dob: dobString
        };

        console.log("🚀 Đang gửi dữ liệu cập nhật:", payload);

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: "PUT", // Hoặc PATCH, tùy vào backend của bạn
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Cập nhật thông tin thành công!");
              setFullName(data.full_name || "");
                setEmail(data.email || "");
                setPhone(data.phone || "");
                setSex(data.sex || "nam");
                setCity(data.city || "");
                setPreference(data.preference || "");

                if (data.dob) {
                    const dobDate = new Date(data.dob);
                    setDay(dobDate.getUTCDate());
                    setMonth(dobDate.getUTCMonth() + 1);
                    setYear(dobDate.getUTCFullYear());
                }
                
                setIsEditing(false); // Tắt chế độ chỉnh sửa
            } else {
                 // Xử lý lỗi, ví dụ email đã tồn tại
                 if (response.status === 400) {
                    setError(data.detail || "Email đã tồn tại hoặc dữ liệu không hợp lệ.");
                 } else {
                    setError(data.detail || "Cập nhật thất bại.");
                 }
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError("Lỗi kết nối. Không thể lưu thay đổi.");
        }
    };


    // Hiển thị loading hoặc error
    if (loading) {
        return <div style={{ fontFamily: 'Montserrat', fontSize: 20, textAlign: 'center', marginTop: 100 }}>Đang tải thông tin cá nhân...</div>;
    }

    return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh"  }}>
      <Navbar />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0, height: "1050px"}}>
            <img
            src={Profilebg}
            alt="Profile background"
            style={{
                width: "100%",
                position: "absolute",
                bottom: -300,
                left: 0,
                zIndex: 0,
            }}
            />
            <img
            src={Secprofilebg}
            alt="Second background"
            style={{
                width: "100%",
                position: "absolute",
                bottom: -300, // adjust this overlap
                left: 0,
                zIndex: 0,
            }}
            />
        </div>
      {/* Centered content frame */}
      <div
        style={{
          width: 1440,
          margin: "0 auto",           // centers the 1440px frame horizontally
          position: "relative",
          minHeight: "calc(100vh - 75px)",
          background: "white",        // optional: helps visualize your frame
          borderRadius: 12,
          zIndex: 1
        }}
      >
        {/* Red Square on the left */}
        <div style={{
            width: 463,
            height: 538,
            position: "relative",
            top: 100,
            left: 18,
            background: "#AD0000",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <img src={TravellerProfilebg} alt="Profile Gradient Background" style={{zIndex: 0}}/>

          {/* Avatar */}
          <div style={{ 
                position: "absolute",
                top: 27,
                right: 169,
                left: 177,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "white", // background circle
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            }}>
            <img
            src={userAvatar}
            alt="Avatar"
            style={{
                width: 117,
                height: 117,
                borderRadius: "50%",
                objectFit: "cover",
            }}
            />
            </div>

            {/* Username box */}
            <h1
                style={{
                    position: "absolute",
                    top: 162,
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "Montserrat",
                    fontWeight: "700",
                    color: "white",
                    letterSpacing: 1.25,
                }}
            >
                {userName}
            </h1>

            <div style={{ 
                position: "absolute", 
                height: '1px', 
                backgroundColor: '#ffffffff', 
                width: '100%',
                bottom: 319
            }}/>

            {/* SWICHES HERE */}
            <div style={{
                alignItems: 'flex-start'
            }}>
                <div
                style={{
                    position: "absolute",
                    top:
                    activeSection === "info"
                        ? 235
                        : activeSection === "accoList"
                        ? 300
                        : activeSection === "bookCalen"
                        ? 365
                        : 440,
                    left: 15,
                    width: 420,
                    height: 55,
                    borderRadius: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.95)", // light box
                    transition: "top 0.3s ease",
                }}
                ></div>

                <button 
                onClick={() => setActiveSection('info')}
                style={{
                    position: "absolute",
                    top: 245,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "info" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer",
                }}>
                    Thông tin cá nhân
                </button>

                <button 
                onClick={() => setActiveSection('accoList')} 
                style={{
                    position: "absolute",
                    top: 310,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "accoList" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Danh sách chỗ ở
                </button>

                <button 
                onClick={() => setActiveSection('bookCalen')} 
                style={{
                    position: "absolute",
                    top: 375,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "bookCalen" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Lịch đặt phòng
                </button>

                <button 
                onClick={() => setActiveSection('setting')} 
                style={{
                    position: "absolute",
                    top: 450,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "setting" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Riêng tư và bảo mật
                </button>
            </div>
        </div>

        <div style={{
            width: 923,
            height: "auto",
            minHeight: 1200,
            position: "absolute",
            top: 100,
            right: 23,
            background: "#ffffffff",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
            paddingBottom: "40px"
        }}>
            {activeSection === "info" && (
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10
                    }}>
                        Thông tin cá nhân
                    </h1>

                    {/* Hiển thị lỗi chung (nếu có) */}
                    {error && (
                        <p style={{
                            color: '#B01C29',
                            fontFamily: 'Montserrat',
                            marginBottom: '10px',
                            fontSize: '14px',
                            textAlign: 'center',
                            backgroundColor: '#ffe6e6',
                            padding: '10px',
                            borderRadius: '5px',
                            width: '90%'
                        }}>{error}</p>
                    )}

                    <div style={{
                        position: 'relative',
                        width: 867,
                        height: 670,
                        background: 'white',
                        borderRadius: 20,
                        border: '1px #878787 solid',
                        top: 60,
                        left: 0,
                        paddingBottom: "140px",
                    }}>
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 11,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Tên Đăng Nhập</label><br />
                            <input
                            type="text"
                            value={userName}
                            disabled={true} // Không cho phép chỉnh sửa username
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 45,
                                left: 31,
                                width: '391px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                            }}
                            />
                        
                        </div>
                            
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 11,
                                left: 445,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>ID người dùng</label><br />
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 45,
                                left: 445,
                                width: '391px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: '#f0f0f0',
                                border: 'none',
                                color: '#878787'
                            }}>{ID}</h1>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 108,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Họ và tên</label><br />
                            <input
                            type="text"
                            value={fullName}
                            disabled={!isEditing}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 142,
                                left: 31,
                                right: 31,
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                boxSizing: 'border-box',
                            }}
                            />
                        </div>
                        
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Giới tính</label><br />
                            <select
                            type="text"
                            value={sex}
                            disabled={!isEditing}
                            onChange={(e) => setSex(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 239,
                                left: 31,
                                width: '122px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                cursor: isEditing ? 'pointer' : 'default',
                            }}>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="undisclosed">Không muốn tiết lộ</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 187,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Vai trò</label><br />
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 239,
                                left: 187,
                                width: '148px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: '#f0f0f0',
                                border: 'none',
                                color: '#878787'
                            }}>{role}</h1>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 377,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Ngày sinh</label><br />
                            <div style={{ 
                                position: 'absolute',
                                display: 'flex',
                                gap: '15px',
                                top: 239,
                                left: 377,
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                
                                }}>
                                <select
                                    value={day}
                                    disabled={!isEditing}
                                    onChange={(e) => setDay(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '122px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <select
                                    value={month}
                                    disabled={!isEditing}
                                    onChange={(e) => setMonth(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '122px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    <option value="1">Tháng 1</option>
                                    <option value="2">Tháng 2</option>
                                    <option value="3">Tháng 3</option>
                                    <option value="4">Tháng 4</option>
                                    <option value="5">Tháng 5</option>
                                    <option value="6">Tháng 6</option>
                                    <option value="7">Tháng 7</option>
                                    <option value="8">Tháng 8</option>
                                    <option value="9">Tháng 9</option>
                                    <option value="10">Tháng 10</option>
                                    <option value="11">Tháng 11</option>
                                    <option value="12">Tháng 12</option>
                                </select>
                                <select
                                    value={year}
                                    disabled={!isEditing}
                                    onChange={(e) => setYear(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '185px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    {[...Array(100)].map((_, i) => {
                                    const y = 2025 - i;
                                    return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 300,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Thành phố cư trú</label><br />
                            <input
                            type="text"
                            value={city}
                            disabled={!isEditing}
                            onChange={(e) => setCity(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 336,
                                left: 31,
                                right: 31,
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                boxSizing: 'border-box',
                            }}
                            />
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 400,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Sở thích cá nhân</label><br />
                            <textarea
                            value={preference}
                            disabled={!isEditing}
                            onChange={(e) => setPreference(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 433,
                                left: 31,
                                right: 31,
                                height: '211px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                resize: 'none',            // prevent manual resizing
                                whiteSpace: 'pre-wrap',    // ensures line breaks and wrapping
                                overflowWrap: 'break-word', // breaks long words if needed
                                boxSizing: 'border-box',
                            }}
                            />
                        </div>
                        
                        <button
                        onClick={() => {
                            if (isEditing) {
                                handleSave(); // Gọi hàm lưu API
                            } else {
                                setIsEditing(true); // Bật chế độ chỉnh sửa
                            }
                        }}>
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 680,
                                left: 588,
                                width: '248px',
                                height: '46px',
                                padding: '8px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? '#ffffffff' : 'rgba(201, 0, 0, 1)',
                                border: 'none',
                                color: isEditing ? 'rgba(201, 0, 0, 1)' : '#ffffffff',
                                cursor: 'pointer',
                                boxShadow: isEditing ? '0px 4px 10px rgba(0, 0, 0, 0.25)' : 'none'
                            }}>{isEditing ? "Lưu chỉnh sửa" : "Chỉnh sửa thông tin" }</h1>
                        </button>

                        {/* Nút Hủy (chỉ hiển thị khi đang edit) */}
                        {isEditing && (
                            <button
                            onClick={() => setIsEditing(false)}> 
                            {/* // TODO: Nên reset lại state về giá trị ban đầu khi fetch */}
                                <h1
                                style={{
                                    position: 'absolute',
                                    fontSize: 20, 
                                    fontFamily: 'Montserrat', 
                                    fontWeight: '700', 
                                    letterSpacing: 1,
                                    top: 680,
                                    left: 588, // Vị trí của nút "Chỉnh sửa" cũ
                                    width: '248px',
                                    height: '46px',
                                    padding: '8px',
                                    borderRadius: 10,
                                    backgroundColor: '#ffffffff',
                                    border: '1px solid #878787',
                                    color: '#555',
                                    cursor: 'pointer',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                                }}>Hủy</h1>
                            </button>
                        )}

                        {/* EMAIL SECTION */}
                        <div
                            style={{
                            position: 'absolute',
                            border: '1px #878787 solid',
                            borderRadius: 12,
                            padding: "16px 20px",
                            top: 780,
                            left: 0,
                            width: 867,
                            boxSizing: 'border-box'
                            }}
                        >
                            <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                            >
                                <div>
                                    <h3
                                    style={{
                                        margin: 0,
                                        fontSize: 18,
                                        fontWeight: 700,
                                    }}
                                    >
                                    Email đã liên kết
                                    </h3>
                                    <p
                                    style={{
                                        margin: 0,
                                        color: "#999",
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                    >
                                    Mỗi tài khoản chỉ liên kết được với một email
                                    </p>
                                </div>

                                <button
                                    style={{
                                    border: "1px solid black",
                                    backgroundColor: "white",
                                    borderRadius: 8,
                                    padding: "8px 16px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    }}
                                    onClick={() => setIsEditing(true)} // Bật editing email
                                >
                                    Thay đổi email
                                </button>
                            </div>
                                <input
                                type="email"
                                value={email}
                                disabled={!isEditing}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    marginTop: 10,
                                    paddingTop: 10,
                                    borderTop: '1px #878787 solid',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    width: '100%',
                                    border: 'none',
                                    backgroundColor: isEditing ? '#fff' : '#f0f0f0'
                                }}/>
                        </div>

                        {/* PHONE SECTION */}
                        <div
                        style={{
                        position: 'absolute',
                        top: 930,
                        left: 0,
                        border: '1px #878787 solid',
                        borderRadius: 12,
                        padding: "16px 20px",
                        width: 867,
                        boxSizing: 'border-box'
                        }}
                        >
                            <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                            >
                                <div>
                                    <h3
                                    style={{
                                        margin: 0,
                                        fontSize: 18,
                                        fontWeight: 700,
                                    }}
                                    >
                                    Số di động
                                    </h3>
                                    <p
                                    style={{
                                        margin: 0,
                                        color: "#999",
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                    >
                                    Mỗi tài khoản chỉ được thêm tối đa 1 số di động
                                    </p>
                                </div>

                            <button
                                style={{
                                border: "1px solid black",
                                backgroundColor: "white",
                                borderRadius: 8,
                                padding: "8px 16px",
                                fontWeight: 700,
                                cursor: "pointer",
                                }}
                                onClick={() => {
                                const newPhone = prompt("Nhập số di động:");
                                if (newPhone) setPhone(newPhone);
                                }}
                            >
                                Thêm số di động
                            </button>
                            </div>

                            {/* Appears only when phone exists */}
                            {phone && (
                            <div
                                style={{
                                marginTop: 10,
                                paddingTop: 10,
                                borderTop: '1px #878787 solid',
                                fontSize: 16,
                                fontWeight: 700,
                                }}
                            >
                                {phone}
                            </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {activeSection === "accoList" && (
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10,
                        zIndex: 1
                    }}>
                        Danh sách chỗ ở
                    </h1>
                    <OwnerDashBoard/>
                </div>
            )}

            {activeSection === "bookCalen" && (
                <div>
                    
                </div>
            )}
            
            {activeSection === "setting" && (
                
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10,
                        zIndex: 1
                    }}>
                        Riêng tư và bảo mật
                    </h1>
                    <ChangePass/>
                </div>
                
            )}
        </div>

      </div>
    </div>
  );
}
