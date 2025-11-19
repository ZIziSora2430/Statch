import React from 'react';

export default function PasswordSection() {
  return (
    <div style={{
        position:'absolute',
      backgroundColor: '#ffffffff',
      minHeight: '100vh',
      width: 867,
      height:300,
      top:57,
      left: 31,
      fontFamily: 'montserrat'
    }}>
      {/* Title */}
      <h2 style={{
        color: 'rgba(135, 135, 135, 1)',
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '13px'
      }}>
        Bảo mật
      </h2>

      {/* Password Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: '20px 25px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Left side - Label */}
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#333'
        }}>
          Mật khẩu
        </span>

        {/* Right side - Button */}
        <button style={{
          backgroundColor: '#DC143C',
          color: 'white',
          padding: '12px 30px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#B01030'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#DC143C'}
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
}