import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function SecuritySection({ showNotify }) {
  // Password states
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Bank info states
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankLoading, setBankLoading] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  
  // Original bank data for cancel
  const [originalBankData, setOriginalBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: ""
  });

  // Fetch bank info on mount
  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/users/bank-info`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBankName(data.bank_name || "");
          setAccountNumber(data.account_number || "");
          setAccountHolder(data.account_holder || "");
          setOriginalBankData({
            bankName: data.bank_name || "",
            accountNumber: data.account_number || "",
            accountHolder: data.account_holder || ""
          });
        }
      } catch (error) {
        console.error("Error fetching bank info:", error);
      }
    };

    fetchBankInfo();
  }, []);

  const handlePasswordSubmit = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      showNotify("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }

    if (newPass !== confirmPass) {
      showNotify("Mật khẩu mới không khớp.", "error");
      return;
    }

    setPassLoading(true);

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
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
        setIsPasswordOpen(false);
      } else {
        showNotify(data.detail || "Đổi mật khẩu thất bại.", "error");
      }
    } catch (error) {
      showNotify("Lỗi kết nối server.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setIsPasswordOpen(false);
    showNotify("Đã hủy thay đổi mật khẩu", "info");
  };

  const handleBankSubmit = async () => {
    if (!bankName || !accountNumber || !accountHolder) {
      showNotify("Vui lòng điền đầy đủ thông tin ngân hàng.", "error");
      return;
    }

    setBankLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/bank-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotify("Cập nhật thông tin ngân hàng thành công!", "success");
        setOriginalBankData({ bankName, accountNumber, accountHolder });
        setIsBankEditing(false);
      } else {
        showNotify(data.detail || "Cập nhật thất bại.", "error");
      }
    } catch (error) {
      showNotify("Lỗi kết nối server.", "error");
    } finally {
      setBankLoading(false);
    }
  };

  const handleBankCancel = () => {
    setBankName(originalBankData.bankName);
    setAccountNumber(originalBankData.accountNumber);
    setAccountHolder(originalBankData.accountHolder);
    setIsBankEditing(false);
    showNotify("Đã hủy thay đổi thông tin ngân hàng", "info");
  };

  return (
    <div 
    style={{
      maxHeight: 980,
      overflow: 'auto'
    }}
    className="w-full px-6 md:px-10 pb-10 pt-2 relative -mt-[55px]">
      
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Riêng tư và bảo mật</h1>
      </div>

      {/* Password Section */}
      <h1 
      style={{
        fontSize: 20,
        marginBottom:10,
        marginTop:-20
      }}
      className="text-gray-700 font-bold text-sm">Bảo mật</h1>
      <div style={{ 
        marginBottom: "10px",
        border: '1px solid #b9b9b9ff',
        padding: '1.25rem',
        borderRadius: 20  
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{
            color: 'rgba(135, 135, 135, 1)',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            Đổi mật khẩu
          </h2>
          <button
            onClick={() => {
              setIsPasswordOpen(!isPasswordOpen);
              if (!isPasswordOpen) {
                setIsBankEditing(false);
              }
            }}
            
            style={{
              padding: "8px 16px",
              backgroundColor: isPasswordOpen ? "#666" : "#AD0000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            {isPasswordOpen ? "Đóng" : "Đổi mật khẩu"}
          </button>
        </div>

        {isPasswordOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
            <div>
              <label style={labelStyle}>Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Mật khẩu mới</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button 
                onClick={handlePasswordSubmit}
                disabled={passLoading}
                style={buttonStyle(passLoading)}
              >
                {passLoading ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
              <button 
                onClick={handlePasswordCancel}
                disabled={passLoading}
                style={cancelButtonStyle}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {!isPasswordOpen && (
          <div style={{ maxWidth: "500px" }}>
            <div>
              <label style={labelStyle}>Mật khẩu hiện tại</label>
              <input
                type="password"
                value="••••••••"
                disabled
                style={disabledInputStyle}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bank Info Section */}
      <h1 
      style={{
        fontSize: 20,
        marginBottom:10,
        marginTop:20
      }}
      className="text-gray-700 font-bold text-sm">Riêng tư</h1>
      <div style={{
        marginBottom: "10px",
        border: '1px solid #b9b9b9ff',
        padding: '1.25rem',
        borderRadius: 20  
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{
            color: 'rgba(135, 135, 135, 1)',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            Thông tin ngân hàng
          </h2>
          <button
            onClick={() => {
              setIsBankEditing(!isBankEditing);
              if (!isBankEditing) {
                setIsPasswordOpen(false); // Close password section when opening bank
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: isBankEditing ? "#666" : "#AD0000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            {isBankEditing ? "Đóng" : "Đổi thông tin ngân hàng"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
          <div>
            <label style={labelStyle}>Tên ngân hàng</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ví dụ: Vietcombank, BIDV, Techcombank..."
              disabled={!isBankEditing}
              style={isBankEditing ? inputStyle : disabledInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Số tài khoản</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
              disabled={!isBankEditing}
              style={isBankEditing ? inputStyle : disabledInputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Tên chủ tài khoản</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Nhập tên chủ tài khoản"
              disabled={!isBankEditing}
              style={isBankEditing ? inputStyle : disabledInputStyle}
            />
          </div>

          {isBankEditing && (
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button 
                onClick={handleBankSubmit}
                disabled={bankLoading}
                style={buttonStyle(bankLoading)}
              >
                {bankLoading ? "Đang xử lý..." : "Lưu thông tin"}
              </button>
              <button 
                onClick={handleBankCancel}
                disabled={bankLoading}
                style={cancelButtonStyle}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#555"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.3s",
  backgroundColor: "white"
};

const disabledInputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  fontSize: "15px",
  outline: "none",
  backgroundColor: "#f5f5f5",
  color: "#999",
  cursor: "not-allowed"
};

const buttonStyle = (loading) => ({
  flex: 1,
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
});

const cancelButtonStyle = {
  flex: 1,
  padding: "12px 24px",
  backgroundColor: "transparent",
  color: "#666",
  border: "2px solid #ddd",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.3s"
};