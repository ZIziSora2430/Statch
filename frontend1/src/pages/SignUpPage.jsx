// ========================================
// FILE: src/pages/SignUpPage.jsx
// ========================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpInBackGround from "../components/SignUpInBackGround";
import '../index.css';

// ✅ MỚI THÊM: Environment variable cho API URL - giúp dễ dàng thay đổi URL khi deploy
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function SignUpPage() {
  // ✅ THÊM: State để lưu email
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // ✅ THÊM: Email state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); // ✅ THÊM: Loading state
  const navigate = useNavigate();

  // ✅ ĐÃ BỎ: Các hàm validation để test dễ hơn
  // const validatePassword = (password) => { ... }
  // const validateUsername = (username) => { ... }

  // ✅ THÊM: Hàm xử lý submit form - GỌI API SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ

    // ✅ ĐÃ BỎ: Các validation phức tạp để test dễ hơn

    // ✅ THÊM: Validate mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    // ✅ THÊM: Validate đã chọn role
    if (!role) {
      setError("Vui lòng chọn vai trò!");
      return;
    }

    setLoading(true); // Bật loading

    try {
      // ✅ DEBUG: Log để kiểm tra
      console.log('🚀 Sending signup request to:', `${API_URL}/signup`);
      console.log('📦 Data:', { username, email, role });

      // ✅ THÊM: Gọi API signup đến backend FastAPI
      // ✅ MỚI CẬP NHẬT: Dùng API_URL từ environment thay vì hardcode
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(), // ✅ MỚI THÊM: .trim() để xóa khoảng trắng thừa
          email: email.trim().toLowerCase(), // ✅ MỚI THÊM: .toLowerCase() để chuẩn hóa email
          password: password,
          role: role, // ✅ THÊM: Gửi role (traveler/owner/admin)
          full_name: null // Có thể thêm field này sau
        }),
      });

      const data = await response.json(); // Parse JSON response

      // ✅ DEBUG: Log response
      console.log('✅ Response status:', response.status);
      console.log('📥 Response data:', data);

      if (response.ok) {
        // ✅ THÊM: Nếu đăng ký thành công, thông báo và chuyển về trang login
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/"); // Quay về trang login
      } else {
        // ✅ THÊM: Hiển thị lỗi từ backend (ví dụ: username đã tồn tại)
        // ✅ MỚI CẬP NHẬT: Xử lý cụ thể lỗi 400 (Bad Request)
        if (response.status === 400) {
          setError(data.detail || "Username hoặc email đã tồn tại!");
        } else {
          setError(data.detail || "Đăng ký thất bại!");
        }
      }
    } catch (err) {
      // ✅ THÊM: Xử lý lỗi khi không kết nối được server
      // ✅ MỚI CẬP NHẬT: Thông báo cụ thể hơn về lỗi kết nối
      console.error('❌ Signup error:', err);
      setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
      console.error("Signup error:", err);
      console.error("Signup error:", err);
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    <div className='page-wrapper'>
      <div className='page-frame'>
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
          }}>Đăng ký</h1>

          {/* Username */}
          <label style={{
            marginBottom: '5px',
            fontSize: '15px',
            fontWeight: '450',
            fontFamily: 'Montserrat'
          }}>Tên đăng nhập</label>

          {/* ✅ THÊM: required để bắt buộc nhập */}
          {/* ✅ ĐÃ BỎ: minLength để test dễ hơn */}
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required // ✅ THÊM
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

          {/* Email */}
          <label style={{
            marginBottom: '5px',
            fontSize: '15px',
            fontWeight: '450',
            fontFamily: 'Montserrat'
          }}>Email</label>

          {/* ✅ THÊM: value, onChange, type="email" và required */}
          <input
            type="email" // ✅ SỬA: Đổi từ "text" thành "email" để validate email
            placeholder="Nhập email"
            value={email} // ✅ THÊM
            onChange={(e) => setEmail(e.target.value)} // ✅ THÊM
            required // ✅ THÊM
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

          {/* Password */}
          <label style={{
            marginBottom: '5px',
            fontFamily: 'Montserrat',
            fontWeight: '450',
            fontSize: '15px'
          }}>Mật khẩu</label>

          {/* ✅ THÊM: required */}
          {/* ✅ ĐÃ BỎ: minLength để test dễ hơn */}
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // ✅ THÊM
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

          {/* Confirm Password */}
          <label style={{
            marginBottom: '5px',
            fontFamily: 'Montserrat',
            fontWeight: '450',
            fontSize: '15px'
          }}>Xác nhận mật khẩu</label>

          {/* ✅ THÊM: required */}
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required // ✅ THÊM
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
          {/* ✅ MỚI CẬP NHẬT: Thêm background màu đỏ nhạt để dễ nhận biết */}
          {error && (
            <p style={{
              color: '#B01C29', // ✅ MỚI CẬP NHẬT: Dùng màu brand thay vì 'red'
              fontFamily: 'Montserrat',
              marginBottom: '10px',
              fontSize: '13px', // ✅ MỚI CẬP NHẬT: Giảm size từ 14px xuống 13px
              textAlign: 'center',
              backgroundColor: '#ffe6e6', // ✅ MỚI THÊM: Background nhạt
              padding: '8px', // ✅ MỚI THÊM: Padding cho đẹp
              borderRadius: '5px' // ✅ MỚI THÊM: Bo góc
            }}>{error}</p>
          )}

          <p style={{
            textAlign: 'right',
            marginTop: '5px',
            marginBottom: '10px',
            fontSize: '14px',
            fontFamily: 'Montserrat'
          }}>
            Bạn đã có tài khoản?{" "}
            {/* ✅ SỬA: Đổi thành button type="button" để tránh submit form */}
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                background: 'none',
                border: 'none',
                color: '#B01C29',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'Montserrat'
              }}
            >
              Đăng nhập tại đây.
            </button>
          </p>

          {/* Role Dropdown */}
          {/* ✅ THÊM: required để bắt buộc chọn role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required // ✅ THÊM
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '10px',
              width: '100%',
              marginBottom: '25px',
              marginTop: '1px',
              fontFamily: 'Montserrat',
              fontSize: '14px'
            }}
          >
            <option value="">--Bạn đăng ký với vai trò gì--</option>
            {/* ✅ SỬA: Đổi value để khớp với backend API (traveler, owner, admin) */}
            <option value="traveler">Người dùng</option>
            <option value="owner">Chủ trọ</option>
            <option value="admin">Quản trị viên</option>
          </select>

          {/* Submit button */}
          {/* ✅ THÊM: type="submit", disabled khi loading */}
          {/* ✅ MỚI THÊM: transition cho smooth effect khi hover */}
          <button
            type="submit"
            disabled={loading} // ✅ THÊM: Disable khi đang loading
            style={{
              backgroundColor: loading ? '#ccc' : '#B01C29', // ✅ THÊM: Đổi màu khi loading
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer', // ✅ THÊM
              fontWeight: 'bold',
              fontFamily: 'Montserrat',
              transition: 'background-color 0.3s' // ✅ MỚI THÊM: Smooth transition
            }}
          >
            {/* ✅ THÊM: Hiển thị text khác khi loading */}
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* Cautions */}
          {/* ✅ MỚI CẬP NHẬT: Thêm color: '#666' và cursor pointer cho link */}
          <p style={{
            fontFamily: 'Montserrat',
            fontSize: '11px',
            textAlign: 'center',
            marginTop: '19px',
            color: '#666' // ✅ MỚI THÊM: Màu xám nhạt cho text phụ
          }}>
            Bằng cách đăng nhập hoặc tạo tài khoản, bạn đồng ý với{" "}
            <span style={{ 
              color: '#4A90E2', // ✅ MỚI CẬP NHẬT: Đổi từ 'lightblue' sang màu xanh chuẩn
              cursor: 'pointer' // ✅ MỚI THÊM: Thêm cursor pointer
            }}>
              Điều khoản & Điều kiện và Chính sách Bảo mật
            </span>{" "}
            của chúng tôi.
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;