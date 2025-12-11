// ========================================
// FILE: src/pages/SignUpPage.jsx
// ========================================
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignUpInBackGround from "../components/SignUpInBackGround";
import Footer from "../components/Footer";
import '../index.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// ✅ MỚI THÊM: Environment variable cho API URL - giúp dễ dàng thay đổi URL khi deploy
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function SignUpPage() {
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

  // ✅ THÊM: State để lưu email
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); // ✅ THÊM: Loading state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

const openTerms = () => {
  setModalContent(`
    <h2>Điều khoản & Điều kiện</h2>
    <p>⚠ Nội dung điều khoản của bạn đặt ở đây...</p>
  `);
  setShowModal(true);
};

const openPrivacy = () => {
  setModalContent(`
    <h2>Chính sách bảo mật</h2>
    <p>🔒 Nội dung chính sách bảo mật đặt ở đây...</p>
  `);
  setShowModal(true);
};

  // ✅ ĐÃ BỎ: Các hàm validation để test dễ hơn
  // const validatePassword = (password) => { ... }
  // const validateUsername = (username) => { ... }

  // ✅ THÊM: Hàm xử lý submit form - GỌI API SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ❗ CHẶN username có dấu + ký tự đặc biệt
    // Chỉ cho phép: a-z A-Z 0-9 . _
    const usernameRegex = /^[a-zA-Z0-9._]+$/;

    if (!usernameRegex.test(username.trim())) {
      toast.error("Tên đăng nhập chỉ được dùng chữ không dấu, số, dấu chấm hoặc gạch dưới!", { autoClose: 900 });
      return;
    }

    // ❗ Kiểm tra mật khẩu trùng khớp
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!", { autoClose: 900 });
      return;
    }

    // ❗ Phải chọn vai trò
    if (!role) {
      toast.error("Vui lòng chọn vai trò!", { autoClose: 900 });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Sending signup request to:', `${API_URL}/signup`);

      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email,
          password: password,
          role: role,
          full_name: null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.", { autoClose: 1000 });
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error(data.detail || "Đăng ký thất bại!", { autoClose: 900 });
      }
    } 
    catch (err) {
      console.error('❌ Signup error:', err);
      toast.error("Không thể kết nối đến server. Vui lòng thử lại!", { autoClose: 900 });
    } 
    finally {
      setLoading(false);
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
    
          }}>Đăng ký</h1>

          {/* Username */}
          <label style={{
            marginBottom: '5px',
            fontSize: '15px',
            fontWeight: '450',
      
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
       
              fontSize: '15px'
            }}
          />

          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Nhập Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%',
              marginBottom: '15px',
       
              fontSize: '15px'
            }}
          />

          {/* Password */}
          <label style={{
            marginBottom: '5px',
            
            fontWeight: '450',
            fontSize: '15px'
          }}>Mật khẩu</label>

          {/* ✅ THÊM: required */}
          {/* ✅ ĐÃ BỎ: minLength để test dễ hơn */}
          <div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // ✅ THÊM
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
                top: 310,
                right:50,
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: "#666",
              }}
            >{showPassword ? "Ẩn" : "Hiện"}</button>
          </div>

          {/* Confirm Password */}
          <label style={{
            marginBottom: '5px',
 
            fontWeight: '450',
            fontSize: '15px'
          }}>Xác nhận mật khẩu</label>

          {/* ✅ THÊM: required */}
          <div>
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required // ✅ THÊM
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
              onClick={() => setShowPassword2(!showPassword2)}
              style={{
                position: "absolute",
                top: 387,
                right: 50,
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: "#666",
              }}
            >{showPassword2 ? "Ẩn" : "Hiện"}</button>
          </div>

          {/* ✅ THÊM: Hiển thị thông báo lỗi nếu có */}
          {/* ✅ MỚI CẬP NHẬT: Thêm background màu đỏ nhạt để dễ nhận biết */}
          {error && (
            <p style={{
              color: '#B01C29', // ✅ MỚI CẬP NHẬT: Dùng màu brand thay vì 'red'
      
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
     
              fontSize: '14px'
            }}
          >
            <option value="">--Bạn đăng ký với vai trò gì--</option>
            {/* ✅ SỬA: Đổi value để khớp với backend API (traveler, owner) */}
            <option value="traveler">Khách du lịch</option>
            <option value="owner">Chủ cho thuê</option>
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

              transition: 'background-color 0.3s' // ✅ MỚI THÊM: Smooth transition
            }}
          >
            {/* ✅ THÊM: Hiển thị text khác khi loading */}
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* Cautions */}
          {/* ✅ MỚI CẬP NHẬT: Thêm color: '#666' và cursor pointer cho link */}
         <p
  style={{
    fontSize: '11px',
    textAlign: 'center',
    marginTop: '19px',
    color: '#666'
  }}
>
  Bằng cách đăng nhập hoặc tạo tài khoản, bạn đồng ý với{" "}
  
<span 
  onClick={openTerms}
  style={{ color: '#4A90E2', cursor: 'pointer', textDecoration: 'underline' }}
>
  Điều khoản & Điều kiện
</span>

{" "}và{" "}

<span 
  onClick={openPrivacy}
  style={{ color: '#4A90E2', cursor: 'pointer', textDecoration: 'underline' }}
>
  Chính sách bảo mật
</span>

  {" "}của chúng tôi.
</p>

       </form>
</div>

{/* 🔥 MODAL POPUP ĐIỀU KHOẢN / CHÍNH SÁCH */}
{showModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
    onClick={() => setShowModal(false)}
  >
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        position: "relative"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowModal(false)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer"
        }}
      >
        ×
      </button>

      <div dangerouslySetInnerHTML={{ __html: modalContent }} />
    </div>
  </div>
)}
    </div>
  );
}

export default SignUpPage;