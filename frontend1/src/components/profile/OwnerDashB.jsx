import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function RoomCard({id, image, category, categoryColor, name, price, isAvailable }) {
  const [available, setAvailable] = useState(isAvailable);
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setAvailable(isAvailable);
  }, [isAvailable]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Room Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        overflow: 'hidden'
      }}>
        <img 
          src={image}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Delete Button */}
        <button style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '24px',
          height: '24px',
          backgroundColor: '#DC143C',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}>
          🗑
        </button>

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: categoryColor,
          color: 'white',
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {category}
        </div>
      </div>

      {/* Room Info */}
      <div style={{
        padding: '15px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          textAlign: 'center'
        }}>
          {name}
        </h3>

        <div style={{
          textAlign: 'center',
          marginBottom: '15px'
        }}>
          <p style={{
            margin: '0 0 5px 0',
            fontSize: '13px',
            color: '#666'
          }}>
            Giá phòng
          </p>
          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#DC143C'
          }}>
            {Number(price).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>

        {/* Toggle and Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Toggle Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '44px',
              height: '24px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={available}
                onChange={() => setAvailable(!available)}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0
                }}
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: available ? '#4CAF50' : '#ccc',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: available ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }} />
              </span>
            </label>
            <span style={{
              fontSize: '13px',
              color: '#666'
            }}>
              Cho phép hiển thị
            </span>
          </div>

          <div ref={menuRef}>
            {/* Three Dots Menu */}
            <button 
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 5px',
              color: '#666'
            }}>
              ⋮
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "280px",
                  right: -10  ,
                  backgroundColor: "white",
                  borderRadius: "8px",
                  width: "100px",
                  padding: "10px 0",
                  zIndex: 1000,
                  marginRight: 40
                }}
              >
                <div
                  onMouseEnter={(e) => e.target.style.color = '#DC143C'}
                  onMouseLeave={(e) => e.target.style.color = '#000000ff'}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#333",
                  }}
                  onClick={() => navigate(`/modify-accommodation/${id}`)}                >
                  Chỉnh sửa
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default function OwnerDashB() {
  const navigate = useNavigate();
  // 1. Thay mảng cứng bằng State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm helper chọn màu cho loại phòng
  const getCategoryColor = (type) => {
    const colors = {
        'Khách sạn': '#8B0000',
        'Biệt thự': '#006B7D',
        'Căn hộ': '#B8860B',
        'Homestay': '#2E8B57',
        'Resort': '#4B0082'
    };
    return colors[type] || '#006B7D'; // Màu mặc định
  };


  // 2. Fetch API khi component load
  useEffect(() => {
    const fetchAccommodations = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
          setLoading(false);
          return;
      }

      try {
        // Gọi Endpoint lấy danh sách nhà của Owner
        const response = await fetch(`${API_URL}/api/owner/accommodations/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("Data fetched:", data);

            // 3. MAP DỮ LIỆU: Backend (snake_case) -> Frontend (camelCase)
            const mappedData = data.map(item => ({
                id: item.accommodation_id,          // Backend: accommodation_id
                image: item.picture_url,            // Backend: picture_url
                name: item.title,                   // Backend: title
                price: item.price,                  // Backend: price (số)
                category: item.property_type,       // Backend: property_type
                categoryColor: getCategoryColor(item.property_type), // Tự sinh màu
                isAvailable: item.status === 'available' // Chuyển status thành boolean
            }));

            setRooms(mappedData);
        } else {
            console.error("Failed to fetch accommodations");
        }
      } catch (error) {
        console.error("Error fetching accommodations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    navigate('/AddAccommodationForm'); // Dùng navigate thay vì window.location để mượt hơn
  }

  // Hiển thị khi đang tải
  if (loading) return <div style={{textAlign: 'center', padding: 50}}>Đang tải danh sách chỗ ở...</div>;


  return (
    <div style={{
        position: 'absolute',
      backgroundColor: '#ffffffff',
      minHeight: 800,
      left: 15,
      top: -15
    }}>

      {/* Grid of Room Cards */}
      <div
        style={{
          position: "relative", // ✅ Not absolute — so it grows naturally
          margin: "80px auto",
          width: "880px",
          maxHeight: 1000, // limit height instead of forcing
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          overflowY: "auto",
          padding: "20px",
          boxSizing: "border-box",
          backgroundColor: "#fff",
          borderRadius: "16px",
        }}
      >
        {/* Kiểm tra nếu có dữ liệu thì render, không thì báo trống */}
        {rooms.length > 0 ? (
            rooms.map((room) => (
                <RoomCard key={room.id} {...room} />
            ))
        ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888", marginTop: 50 }}>
                <h3>Bạn chưa có chỗ ở nào.</h3>
                <p>Bấm nút "+" để đăng bài đầu tiên!</p>
            </div>
        )}
      </div>

      {/* Add Button */}
      <button style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        width: '140px',
        height: '60px',
        backgroundColor: 'white',
        border: '2px solid #333',
        borderRadius: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
      onClick={(e) => handleClick(e)}
      >
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          lineHeight: '1'
        }}>
          +
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          marginTop: '2px'
        }}>
          Thêm chỗ ở mới
        </span>
      </button>
    </div>
  );
}