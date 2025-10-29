import SignUpInBackGround from "../components/SignUpInBackGround"
import { useNavigate } from "react-router-dom";
import '../index.css'
import SignUpPage from "./SignUpPage";

function App() {
  const navigate = useNavigate()
  
  return (
    <div className="page-wrapper">
      <div className="page-frame">
        <SignUpInBackGround/> 

        {/* White login card */}
        <div
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          width: '380px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          marginRight: '80px', // move inward from the right edge
        }}
        >
        <h1 style={{ color: '#B01C29', 
                    textAlign: 'center', 
                    marginBottom: '20px', 
                    fontSize: '24px', 
                    fontWeight: '700',
                    fontFamily: 'Montserrat' 
                    }}>Đăng nhập</h1>

        <h1 style={{ marginBottom: '5px', 
                    fontSize: '15px', 
                    fontWeight: '450',
                    fontFamily: 'Montserrat'  
                    }}>Tên đăng nhập</h1>

        <input
          type="text"
          placeholder="Nhập tên đăng nhập"
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
                        fontFamily: 'Montserrat',
                        fontWeight: '450',
                        fontSize: '15px'
         }}>Mật khẩu</label>

        <input
          type="password"
          placeholder="Nhập mật khẩu"
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

        <a //========================================================================================
          href="#"
          style={{
            display: 'block',
            textAlign: 'right',
            fontSize: '14px',
            color: '#333',
            textDecoration: 'none',
            marginBottom: '20px',
            fontFamily: 'Montserrat'
          }}
        >
          Quên mật khẩu?
        </a>

        <button
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
          Đăng nhập
        </button>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', fontFamily: 'Montserrat' }}>
          Bạn không có tài khoản?{" "} 
           <button onClick={() => {navigate("/signup")}}>Đăng ký tại đây.</button>
        </p>
        </div>
      </div>
    </div>
  );
}

export default App
