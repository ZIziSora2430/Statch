import new_logo from '../images/new_logo.jpg';
import Bell from '../images/Bell.png';
import Avatar from '../images/Avatar.png';
import home from '../images/Home.svg';
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

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
          src={Avatar}
          alt="Avatar"
          onClick={() => setOpen(!open)}
          style={{
            height: 45,
            width: 45,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          }}
          />
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
                onClick={() => alert("Logged out")}
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
