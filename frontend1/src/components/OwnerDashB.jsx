import React, { useState } from 'react';

function RoomCard({ image, category, categoryColor, name, price, isAvailable }) {
  const [available, setAvailable] = useState(isAvailable);

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
            {price}
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

          {/* Three Dots Menu */}
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px',
            color: '#666'
          }}>
            ⋮
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoomListingGrid() {
  const rooms = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
      category: 'Khách sạn',
      categoryColor: '#8B0000',
      name: 'FiveStar Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      category: 'Villa',
      categoryColor: '#006B7D',
      name: 'Luxury Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: true
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
      category: 'Khách sạn',
      categoryColor: '#8B0000',
      name: 'FiveStar Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      category: 'Villa',
      categoryColor: '#006B7D',
      name: 'Luxury Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
      category: 'Căn hộ',
      categoryColor: '#B8860B',
      name: 'Nicey Hotel',
      price: '800000 VNĐ/Đêm',
      isAvailable: false
    }
  ];

  const handleClick = (e) => {
    e.stopPropagation();
    window.location.href = '/AddAccommodationForm';
  }

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
  {rooms.map((room, index) => (
    <RoomCard key={index} {...room} />
  ))}
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