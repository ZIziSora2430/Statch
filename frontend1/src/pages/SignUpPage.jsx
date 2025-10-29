import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpInBackGround from "../components/SignUpInBackGround";
import '../index.css';

function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate("")

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
    } else {
      setError("");
      console.log("Form submitted:", { username, password });
      // Proceed with your signup logic or navigation
    }
  };

  const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '100%',
    marginBottom: '15px',
    fontFamily: 'Montserrat',
    fontSize: '15px'
  };

  return (
    <div className='page-wrapper'>
      <div className='page-frame'>
        <SignUpInBackGround />

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
          <label style={{ marginBottom: '5px', 
                        fontSize: '15px', 
                        fontWeight: '450',
                        fontFamily: 'Montserrat'  
                    }}>Tên đăng nhập</label>

          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

            <label style={{ marginBottom: '5px', 
                        fontSize: '15px', 
                        fontWeight: '450',
                        fontFamily: 'Montserrat'  
                    }}>Email</label>

          <input
            type="text"
            placeholder="Nhập email"
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
          <label style={{ marginBottom: '5px',
                        fontFamily: 'Montserrat',
                        fontWeight: '450',
                        fontSize: '15px'
            }}>Mật khẩu</label>

          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <label style={{ marginBottom: '5px',
                        fontFamily: 'Montserrat',
                        fontWeight: '450',
                        fontSize: '15px'
            }}>Xác nhận mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Error message */}
            {error && <p style={{ color: 'red', 
                                fontFamily: 'Montserrat', 
                                marginBottom: '10px',
                                fontSize: '15px'
                            }}>{error}</p>}

            <p style={{ textAlign: 'right', 
                        marginTop: '5px',
                        marginBottom: '10px',
                        fontSize: '14px', 
                        fontFamily: 'Montserrat' 
                    }}> Bạn đã có tài khoản?{" "} 
                <button onClick={() => {navigate("/")}}>Đăng nhập tại đây.</button>
            </p>

            {/* Role Dropdown */}
            <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
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
            <option value="user">Người dùng</option>
            <option value="host">Chủ trọ</option>
            <option value="admin">Quản trị viên</option>
            </select>

            
          {/* Submit button */}
          <button
            type="submit"
            style={{
                backgroundColor: '#B01C29',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                width: '100%',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'Montserrat'
            }}
          >
            Đăng ký
          </button>

          {/*Cautions*/}
            <p style={{
                fontFamily: 'Montserrat',
                fontSize: '11px',
                textAlign: 'center',
                marginTop: '19px'
            }}>Bằng cách đăng nhập hoặc tạo tài khoản, bạn đồng ý với{" "}
            <span style={{
                color: 'lightblue'
            }}>Điều khoản & Điều kiện và Chính sách Bảo mật</span>{" "}của chúng tôi.</p>

        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
