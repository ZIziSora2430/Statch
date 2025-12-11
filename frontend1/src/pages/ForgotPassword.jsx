import React, { useState } from "react";
import SignUpInBackGround from "../components/SignUpInBackGround";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify';
import '../index.css';


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
function SignInPage() {
  const navigate = useNavigate();
  // Các bước: 1 (Nhập Email), 2 (Nhập Mã), 3 (Nhập Pass mới)
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- BƯỚC 1: Gửi yêu cầu lấy mã ---
  const handleSendCode = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email."); 
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2); // Chuyển sang bước nhập mã
        toast.success("Mã xác nhận đã được gửi vào email của bạn.");
      } else {
        toast.error(data.detail || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 2: Xác nhận mã (Chuyển sang giao diện nhập pass) ---
  const handleVerifyCodeUI = async () => {
    if (confirmCode.length < 6) {
      toast.warning("Vui lòng nhập mã xác nhận hợp lệ.");
      return;
    }
    try {
      // 2. Gọi API kiểm tra mã
      const response = await fetch(`${API_URL}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: email, 
            code: confirmCode 
        }),
      });
      if (response.ok) {
        setStep(3); // Chuyển sang bước nhập pass mới
        toast.info("Mã xác nhận hợp lệ. Vui lòng tạo mật khẩu mới.");
      } else {
        const data = await response.json();
        toast.error(data.detail || "Mã xác nhận sai hoặc đã hết hạn.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server.");
      return;
    } finally {
      setLoading(false);
    }
    
  };

  // --- BƯỚC 3: Gửi API đặt lại mật khẩu ---
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: confirmCode,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        navigate("/");
      } else {
        toast.error(data.detail || "Mã xác nhận sai hoặc đã hết hạn.");
        if(data.detail === "Mã xác nhận không hợp lệ hoặc đã hết hạn"){
            setStep(2); // Quay lại bước nhập mã nếu sai
            toast.warning("Phiên làm viêchn đã hết hạn. Vui lòng nhập lại mã xác nhận.");
        }
      }
    } catch (err) {
      toast.error("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-frame">
        <SignUpInBackGround />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            width: '380px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            marginRight: '80px',
          }}
        >
          <h1 style={{ color: '#B01C29', textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
            {step === 1 ? "Quên mật khẩu" : step === 2 ? "Nhập mã xác nhận" : "Tạo mật khẩu mới"}
          </h1>

          {/* Hiển thị thông báo lỗi hoặc thành công */}
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px', fontSize: '14px', background: '#ffe6e6', padding: '5px', borderRadius: '5px' }}>{error}</p>}
          {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>{message}</p>}

          {step === 1 && (
            <>
              <h1 style={{ marginBottom: '5px', fontSize: '15px', fontWeight: '450' }}>Email đã liên kết</h1>
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '15px', fontSize: '15px' }}
              />
              <button onClick={handleSendCode} disabled={loading} style={buttonStyle(loading)}>
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </button>
            </>
          )}

          {/* --- STEP 2: NHẬP MÃ OTP --- */}
          {step === 2 && (
            <>
              <p style={{marginBottom: '15px', color: '#666', fontSize: '14px'}}>Vui lòng kiểm tra email <b>{email}</b> và nhập mã 6 số.</p>
              <input
                placeholder="Nhập mã"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '10px', fontSize: '15px' }}
              />

              <button onClick={handleVerifyCodeUI} 
                      style={buttonStyle(false)} 
                      disabled={loading}
              >
                {loading ? 'Đang kiểm tra...' : 'Tiếp tục'}
              </button>
              <button 
                onClick={() => setStep(1)} 
                style={{width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline'}}
              >
                Gửi lại mã?
              </button>
            </>
          )}

            {/* --- STEP 3: ĐỔI MẬT KHẨU --- */}
            {step === 3 && (
            <>
              <label style={{ marginTop: '15px', fontWeight: '450', fontSize: '15px' }}>Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '10px', fontSize: '15px' }}
              />

              <label style={{ marginTop: '5px', fontWeight: '450', fontSize: '15px' }}>Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '10px', fontSize: '15px' }}
              />

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#ccc' : '#B01C29',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  width: '100%',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </>
          )}

          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}

          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
            Bạn không có tài khoản?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{ background: 'none', border: 'none', color: '#B01C29', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Đăng ký tại đây.
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
const inputStyle = {
  padding: '12px', border: '1px solid #ddd', borderRadius: '8px', 
  width: '100%', marginBottom: '15px', fontSize: '15px', outline: 'none',
  boxSizing: 'border-box' // Quan trọng để padding không làm vỡ layout
};

const buttonStyle = (loading) => ({
  backgroundColor: loading ? '#ccc' : '#B01C29',
  color: 'white', border: 'none', borderRadius: '8px',
  padding: '12px', width: '100%', cursor: loading ? 'not-allowed' : 'pointer',
  fontWeight: 'bold', fontSize: '16px', transition: '0.3s',
  boxShadow: '0 2px 5px rgba(176, 28, 41, 0.3)'
});
export default SignInPage;
