// ========================================
// FILE: src/pages/SignInPage.jsx
// ========================================
import React, { useState } from "react";
import SignUpInBackGround from "../components/SignUpInBackGround";
import { useNavigate } from "react-router-dom";
import '../index.css';

// ✅ MỚI THÊM: Environment variable cho API URL (giống SignUp)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function SignInPage() {
  const navigate = useNavigate();
  
  // ✅ THÊM: State để lưu thông tin đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ THÊM: Hiển thị lỗi nếu có
  const [loading, setLoading] = useState(false); // ✅ THÊM: Trạng thái loading khi đang gọi API

  // ✅ THÊM: Hàm xử lý submit form - GỌI API LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    setError(""); // Xóa lỗi cũ
    setLoading(true); // Bật loading

    // ✅ MỚI THÊM: Log để debug (giống SignUp)
    console.log('🚀 Sending login request to:', `${API_URL}/login`);
    console.log('📦 Data:', { username });

    try {
      // ✅ THÊM: Gọi API login đến backend FastAPI
      // ✅ MỚI CẬP NHẬT: Dùng API_URL từ environment
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(), // ✅ MỚI THÊM: Xóa khoảng trắng thừa
          password: password,
        }),
      });

      const data = await response.json(); // Parse JSON response

      // ✅ MỚI THÊM: Log response (giống SignUp)
      console.log('✅ Response status:', response.status);
      console.log('📥 Response data:', data);

      if (response.ok) {
        // ✅ THÊM: Nếu đăng nhập thành công, lưu token và role vào localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("username", username);

        console.log('✅ Login successful! Role:', data.role);

        // ✅ THÊM: Điều hướng dựa trên role của user
        if (data.role === "owner") {
          navigate("/owner/dashboard"); // Chủ trọ -> dashboard
        } else if (data.role === "traveler") {
          navigate("/traveller/home"); // Người dùng -> home
        } else {
          navigate("/home"); // Các role khác
        }
      } else {
        // ✅ THÊM: Hiển thị lỗi nếu đăng nhập thất bại
        // ✅ MỚI CẬP NHẬT: Xử lý cụ thể lỗi 401 (Unauthorized)
        if (response.status === 401) {
          setError("Tên đăng nhập hoặc mật khẩu không đúng!");
        } else {
          setError(data.detail || "Đăng nhập thất bại!");
        }
      }
    } catch (err) {
      // ✅ THÊM: Xử lý lỗi khi không kết nối được server
      console.error('❌ Login error:', err);
      setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
      console.error("Login error:", err);
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-frame">
        <SignUpInBackGround />

        {/* ✅ THÊM: Thêm onSubmit để gọi handleSubmit */}
        <form
          onSubmit={handleSubmit}
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
          <h1 style={{
            color: '#B01C29',
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '700',
            fontFamily: 'Montserrat'
          }}>Đăng nhập</h1>

          <h1 style={{
            marginBottom: '5px',
            fontSize: '15px',
            fontWeight: '450',
            fontFamily: 'Montserrat'
          }}>Tên đăng nhập</h1>

          {/* ✅ THÊM: value và onChange để lưu username vào state */}
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required // ✅ THÊM: Bắt buộc nhập
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%',
              marginBottom: '15px',
              fontFamily: 'Montserrat',
              fontSize: '15px'
            }}
          />

          <label style={{
            marginBottom: '5px',
            fontFamily: 'Montserrat',
            fontWeight: '450',
            fontSize: '15px'
          }}>Mật khẩu</label>

          {/* ✅ THÊM: value và onChange để lưu password vào state */}
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // ✅ THÊM: Bắt buộc nhập
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%',
              marginBottom: '10px',
              fontFamily: 'Montserrat',
              fontSize: '15px'
            }}
          />

          {/* ✅ THÊM: Hiển thị thông báo lỗi nếu có */}
          {/* ✅ MỚI CẬP NHẬT: Style giống SignUp (có background màu đỏ nhạt) */}
          {error && (
            <p style={{
              color: '#B01C29', // ✅ MỚI CẬP NHẬT: Dùng màu brand
              fontFamily: 'Montserrat',
              marginBottom: '10px',
              fontSize: '13px', // ✅ MỚI CẬP NHẬT: Giảm size
              textAlign: 'center',
              backgroundColor: '#ffe6e6', // ✅ MỚI THÊM: Background nhạt
              padding: '8px', // ✅ MỚI THÊM
              borderRadius: '5px' // ✅ MỚI THÊM
            }}>{error}</p>
          )}

          {/* ✅ MỚI CẬP NHẬT: Đổi <a> thành <button> để tránh navigation không mong muốn */}
          <button
            type="button"
            onClick={() => {/* TODO: Implement forgot password */}}
            style={{
              background: 'none',
              border: 'none',
              display: 'block',
              marginLeft: 'auto',
              fontSize: '14px',
              color: '#333',
              textDecoration: 'none',
              marginBottom: '20px',
              fontFamily: 'Montserrat',
              cursor: 'pointer'
            }}
          >
            Quên mật khẩu?
          </button>

          {/* ✅ THÊM: type="submit" để trigger handleSubmit, disabled khi đang loading */}
          {/* ✅ MỚI THÊM: Transition effect giống SignUp */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#B01C29', // ✅ THÊM: Đổi màu khi loading
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer', // ✅ THÊM: Đổi cursor khi loading
              fontWeight: 'bold',
              fontFamily: 'Montserrat',
              transition: 'background-color 0.3s' // ✅ MỚI THÊM: Smooth transition
            }}
          >
            {/* ✅ THÊM: Hiển thị text khác nhau khi loading */}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: '15px',
            fontSize: '14px',
            fontFamily: 'Montserrat'
          }}>
            Bạn không có tài khoản?{" "}
            {/* ✅ SỬA: Đổi từ <a> thành <button> với type="button" để tránh submit form */}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                background: 'none',
                border: 'none',
                color: '#B01C29',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'Montserrat'
              }}
            >
              Đăng ký tại đây.
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignInPage