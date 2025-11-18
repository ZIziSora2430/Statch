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
import BookingList from "../components/BookingList"
import OwnerProfileDetails from "../components/OwnerProfileDetails";

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
              
              // navigate("/"); // Chuyển về trang đăng nhập nếu không có token
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

                // ⚠️ Các trường (sex, city, phone, preference, dob) không có 
                // trong 'models.User' của bạn, nên chúng sẽ là giá trị default ("")
                // setSex(data.sex || "nam"); 
                // setCity(data.city || "");
                // ...
              } else {
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

        // Dựa trên service.py, hàm update_user chỉ nhận full_name và email
        const payload = {
            full_name: fullName,
            email: email,
            // ⚠️ Các trường khác (city, sex, v.v.) sẽ không được lưu
            // trừ khi bạn cập nhật schemas.UserUpdate và service.py
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
                // Cập nhật lại state từ dữ liệu trả về (nếu cần)
                setFullName(data.full_name || "");
                setEmail(data.email || "");
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
        return <div style={{  fontSize: 20, textAlign: 'center', marginTop: 100 }}>Đang tải thông tin cá nhân...</div>;
    }

    return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh"  }}>
        <Navbar />

        {error && (
            <div style={{
                position: "fixed",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#ff4d4d",
                color: "white",
                padding: "15px 25px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                zIndex: 9999,
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                animation: "fadeIn 0.3s"
            }}>
                {error}
            </div>
        )}

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
                    <OwnerProfileDetails/>
                </div>
            )}

            {activeSection === "accoList" && (
                <div>
                    <h1 style={{
                        fontSize: 24, 
                         
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
                    <h1 style={{
                        fontSize: 24, 
                         
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10,
                        zIndex: 1
                    }}>
                        Lịch đặt phòng
                    </h1>
                    <BookingList/>
                </div>
            )}
            
            {activeSection === "setting" && (
                
                <div>
                    <h1 style={{
                        fontSize: 24, 
                         
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
