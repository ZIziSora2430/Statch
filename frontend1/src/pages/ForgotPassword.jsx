import React, { useState } from "react";
import SignUpInBackGround from "../components/SignUpInBackGround";
import { useNavigate } from "react-router-dom";
import '../index.css';

function SignInPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [codeVerified, setCodeVerified] = useState(false); // ✅ Check if code is correct
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Dummy function to simulate code verification
  const handleVerifyCode = () => {
    if (confirmCode === "123456") { // replace with real API check
      setCodeVerified(true);
      setError("");
    } else {
      setError("Mã xác nhận không đúng");
    }
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    setLoading(true);

    // ✅ Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Đặt lại mật khẩu thành công!");
      navigate("/signin");
    }, 1000);
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
            Quên mật khẩu
          </h1>

          <h1 style={{ marginBottom: '5px', fontSize: '15px', fontWeight: '450' }}>Email đã liên kết</h1>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '15px', fontSize: '15px' }}
          />

          <label style={{ marginBottom: '5px', fontWeight: '450', fontSize: '15px' }}>Mã xác nhận</label>
          <input
            placeholder="Nhập mã"
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            required
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', marginBottom: '10px', fontSize: '15px' }}
          />

          {!codeVerified ? (
            <button
              type="button"
              onClick={handleVerifyCode}
              style={{
                backgroundColor: '#B01C29',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                paddingTop: 10,
                width: '100%',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Xác nhận mã
            </button>
          ) : (
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

export default SignInPage;
