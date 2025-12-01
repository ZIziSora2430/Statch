import new_logo from '../images/new_logo.jpg';
import Bell from '../images/Bell.png';
import Avatar from '../images/Avatar.png';
import home from '../images/Home.svg';
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import defaultAvatar from "../images/avatar-default.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export default function Navbar() {
  const navigate = useNavigate();

  const [openAvatar, setOpenAvatar] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const handleDeleteNotification = async (id) => {
  try {
    const token = localStorage.getItem("access_token");

    await fetch(`${API_URL}/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Xoá khỏi UI
    setNotifications((prev) => prev.filter(n => n.id !== id));
  } catch (error) {
    console.error("Lỗi xoá thông báo:", error);
  }
};

useEffect(() => {
  const fetchNoti = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.log("Lỗi load thông báo:", err);
    }
  };

  fetchNoti();
}, []);


  const avatarRef = useRef();
  const notiRef = useRef();
  const hasAvatar = false;
  const avatarImage = hasAvatar ? Avatar : defaultAvatar;
  const handleNotificationRead = async (notification) => {
  try {
    const token = localStorage.getItem("access_token");

    await fetch(`${API_URL}/api/notifications/${notification.id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Cập nhật trạng thái đã đọc ở UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, is_read: true } : n
      )
    );
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
  }

  handleNotificationClick(notification);
};


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setOpenAvatar(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setOpenNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
  const role = localStorage.getItem("user_role");

  if (role === "owner") {
    navigate("/profilet?section=booking");   // BookingList.jsx
  } else {
    navigate("/profilet?section=history");   // ReservationHis.jsx
  }

  setOpenNoti(false); // đóng menu
};

  return (
    <div
      style={{
        width: '100%',
        height: 50,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <img src={new_logo} 
      onClick={() => navigate('/home')}
      alt="Logo" 
      style={{ height: 25, cursor: "pointer" }} />

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>

        {/* Home */}
        <button onClick={() => navigate("/home")}>
          <img src={home} alt="Home" style={{ height: 25, cursor: 'pointer' }} />
        </button>

        {/* Bell Icon */}
        <div ref={notiRef} style={{ position: "relative" }}>
          <div 
            onClick={() => {
              setOpenNoti(!openNoti);
              setOpenAvatar(false);
            }}
            style={{ cursor: "pointer", position: 'relative' }}
          >
            <img src={Bell} alt="Bell" style={{ height: 25 }} />
            {/* Hiển thị chấm đỏ nếu có thông báo mới (optional) */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: 'red', color: 'white', borderRadius: '50%',
                width: 15, height: 15, fontSize: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
          {openNoti && (
            <div
              style={{
                position: "absolute",
                top: "35px",
                right: -10,
                width: "300px",
                overflowY: "visible",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 9999,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #eee",
                  fontWeight: "bold",
                  fontSize: "14px",
                  backgroundColor: "#BF1D2D",
                  color: "white",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                Thông báo mới ({unreadCount})
              </div>

              {/* --- 2. Render List Thông báo từ API --- */}
              {notifications.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#666", fontSize: "13px" }}>
                  Chưa có thông báo nào
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "10px 15px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      transition: "0.2s",
                      fontSize: "13px",
                      position: "relative"
                    }}
                  >
                    {/* Click thông báo */}
                    <div onClick={() => handleNotificationRead(n)}>
                      <div style={{fontWeight: n.is_read ? 'normal' : 'bold'}}>
                        {n.message}
                      </div>
                      <div style={{fontSize: "11px", color: "#999", marginTop: "4px"}}>
                        {new Date(n.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {/* Nút xoá */}
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 8,
                        color: "#BF1D2D",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "20px",      // ⬅ TO HƠN!
                        lineHeight: "20px",
                        padding: "2px 5px",    // dễ bấm hơn
                        borderRadius: "4px",
                      }}
                      onClick={() => handleDeleteNotification(n.id)}
                    >
                      ×
                    </span>
                  </div>
                ))
              )}

              {/* SEE MORE BUTTON */}
              {notifications.length > 0 && (
                <div
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    color: "#BF1D2D",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderTop: "1px solid #eee",
                  }}
                  onClick={() => navigate("/notifications")}
                >
                  Xem tất cả
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={avatarRef} style={{ position: "relative" }}>
          <img
            src={avatarImage}
            alt="Avatar"
            onClick={() => {
              setOpenAvatar(!openAvatar);
              setOpenNoti(false); // đóng notification khi mở avatar
            }}
            style={{
              height: 35,
              width: 35,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              cursor: 'pointer'
            }}
          />

          {/* Avatar Dropdown */}
          {openAvatar && (
            <div
              style={{
                position: "absolute",
                top: "55px",
                right: 0,
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                width: "150px",
                padding: "10px 0",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onClick={() => navigate("/profilet")}
              >
                Thông tin cá nhân
              </div>
              <div
                style={{
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onClick={() => alert("Settings clicked")}
              >
                Cài đặt
              </div>
              <div
                style={{
                  padding: "10px 15px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "red",
                  borderTop: "1px solid #eee",
                  marginTop: "5px",
                }}
                onClick={() => navigate("/")}
              >
                Đăng xuất
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
