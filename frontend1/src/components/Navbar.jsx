import new_logo from '../images/new_logo.jpg';
import Bell from '../images/Bell.png';
import Avatar from '../images/Avatar.png';
import home from '../images/Home.svg';
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import defaultAvatar from "../images/avatar-default.svg"

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const hasAvatar = false;
  const avatarImage = hasAvatar ? Avatar : defaultAvatar; // REMEMBER TO ALTER

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <img src={new_logo} alt="Logo" style={{ height: 25 }} />

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        <button onClick = {() => navigate("/home")}>
          <img src={home} alt="Home" style={{ height: 25, cursor: 'pointer'}}/>
        </button>
        <img src={Bell} alt="Bell" style={{ height: 25, cursor: 'pointer' }} />
        
        <div ref={menuRef}>
          <img
          src={avatarImage}
          alt="Avatar"
          onClick={() => setOpen(!open)}
          style={{
            height: 35,
            width: 35,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
            cursor: 'pointer'
          }}
          />
             {/* Notification Dropdown */}
        {openNoti && (
  <div
    style={{
      position: "absolute",
      top: "25px",
      right: 0,
      width: "300px",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: "0",
      zIndex: 9999,
    }}
  >
    {/* Header */}
    <div
      style={{
        padding: "15px 15px",
        borderBottom: "1px solid #eee",
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#BF1D2D",
        color: "white",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
      }}
    >
      Thông báo mới
    </div>

    {/* Notification list */}
    <div
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={() => navigate("/notifications")}
      onMouseEnter={(e) => (e.target.style.background = "#f8f8f8")}
      onMouseLeave={(e) => (e.target.style.background = "white")}
    >
      • Nhân viên A vừa gửi đơn xin nghỉ
    </div>

    <div
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={() => navigate("/notifications")}
      onMouseEnter={(e) => (e.target.style.background = "#f8f8f8")}
      onMouseLeave={(e) => (e.target.style.background = "white")}
    >
      • Đơn nghỉ phép của bạn đã được phê duyệt
    </div>

    <div
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={() => navigate("/notifications")}
      onMouseEnter={(e) => (e.target.style.background = "#f8f8f8")}
      onMouseLeave={(e) => (e.target.style.background = "white")}
    >
      • Có cuộc họp vào 15:00 hôm nay
    </div>

    {/* SEE MORE BUTTON */}
    <div
      style={{
        padding: "12px",
        textAlign: "center",
        color: "#BF1D2D",
        fontWeight: "bold",
        fontSize: "14px",
        borderTop: "1px solid #eee",
        cursor: "pointer",
        borderBottomLeftRadius: "8px",
        borderBottomRightRadius: "8px",
        transition: "0.2s",
      }}
      onClick={() => navigate("/notifications")}
      onMouseEnter={(e) => (e.target.style.background = "#f8f8f8")}
      onMouseLeave={(e) => (e.target.style.background = "white")}
    >
      Xem thêm →
    </div>
  </div>
)}

          {/* Dropdown menu */}
          {open && (
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
                marginRight: 40
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
