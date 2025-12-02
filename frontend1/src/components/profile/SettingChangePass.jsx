import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function PasswordSection({ showNotify }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate cơ bản
    if (!oldPass || !newPass || !confirmPass) {
      showNotify("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }

    if (newPass !== confirmPass) {
      showNotify("Mật khẩu mới không khớp.", "error");
      return;
    }

    setLoading(true);

    // 2. Gọi API
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPass,
          new_password: newPass,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotify("Đổi mật khẩu thành công!", "success");
        // Reset form
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        showNotify(data.detail || "Đổi mật khẩu thất bại.", "error");
      }
    } catch (error) {
      showNotify("Lỗi kết nối server.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{
        position:'absolute',
      backgroundColor: 'transparent',
      minHeight: '100vh',
      width: 867,
      height:300,
      top:-40,
      left: 31,
    }}>
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Riêng tư và bảo mật</h1>
      </div>

      {/* Title */}
      <h2 style={{
        color: 'rgba(135, 135, 135, 1)',
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '13px'
      }}>
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
        
        {/* Mật khẩu cũ */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            style={inputStyle}
          />
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
            Mật khẩu mới
          </label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            style={inputStyle}
          />
        </div>

        {/* Nhập lại mật khẩu mới */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            style={inputStyle}
          />
        </div>

        <button 
            type="submit" 
            disabled={loading}
            style={{
                marginTop: "20px",
                padding: "12px 24px",
                backgroundColor: "#AD0000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background 0.3s"
            }}
        >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.3s",
};