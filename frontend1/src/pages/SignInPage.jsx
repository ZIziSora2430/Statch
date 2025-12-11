// ========================================
// FILE: src/pages/SignInPage.jsx
// ========================================
import React, { useState } from "react";
import SignUpInBackGround from "../components/SignUpInBackGround";
import { useNavigate } from "react-router-dom";
import '../index.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react"; 

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function SignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("user_role"); 
    const token = localStorage.getItem("access_token");

    if (token) {
      if (role === "owner") {
        navigate("/profile");  // owner page
      } else {
        navigate("/home");       // traveller / normal user
      }
    }
  }, [navigate]);

  
  // ✅ THÊM: State để lưu thông tin đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  // ✅ THÊM: Hàm xử lý submit form - GỌI API LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang
  
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

        toast.success("Đăng nhập thành công! Đang chuyển hướng...", {
          position: "top-right",
          autoClose: 900
        });

        // ✅ THÊM: Điều hướng dựa trên role của user
        setTimeout(() => {
            if (data.role === "owner") {
            navigate("/profileo"); // Chủ trọ -> dashboard
          } else if (data.role === "traveler") {
            navigate("/home"); // Người dùng -> home
          } else {
            navigate("/home"); // Các role khác
          }
          console.log(data.access_token);
        }, 1200);
        
      } else {
        if (response.status === 401) {
          toast.error("Tên đăng nhập hoặc mật khẩu không đúng!", {autoClose: 900});
        } else {
          toast.error(data.detail || "Đăng nhập thất bại!", {autoClose: 900});
        }
      }
    } catch (err) {
      // ✅ THÊM: Xử lý lỗi khi không kết nối được server
      console.error('❌ Login error:', err);
      toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
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
            
          }}>Đăng nhập</h1>

          <h1 style={{
            marginBottom: '5px',
            fontSize: '15px',
            fontWeight: '450',
            
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
             
              fontSize: '15px'
            }}
          />

          <label style={{
            marginBottom: '5px',
         
            fontWeight: '450',
            fontSize: '15px'
          }}>Mật khẩu</label>

          {/* ✅ THÊM: value và onChange để lưu password vào state */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // ✅ THÊM: Bắt buộc nhập
              style={{
                padding: '10px 40px 10px 10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                width: '100%',
                marginBottom: '10px',
                fontSize: '15px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: 21,
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: "#666",
              }}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          {/* ✅ MỚI CẬP NHẬT: Đổi <a> thành <button> để tránh navigation không mong muốn */}
          <button
            type="button"
            onClick={() => navigate("/forgotpass")}
            style={{
              background: 'none',
              border: 'none',
              display: 'block',
              marginLeft: 'auto',
              fontSize: '14px',
              color: '#333',
              textDecoration: 'none',
              marginBottom: '20px',
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
          
              }}
            >
              Đăng ký tại đây.
            </button>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignInPage