import React from 'react';
import SuccessBookingbg from "../../images/SuccessBookingbg.svg";
import Avatar from "../../images/Avatar.png"

// Separate component for Confirmed Status
function ConfirmedStatus() {
  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0,
        backgroundColor: '#00C851',
        borderRadius: '0px',
        width: '217px',
        height: '63px',
        color: 'white', 
        fontSize: 20, 
        fontFamily: 'Montserrat', 
        fontWeight: '800',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Đã xác nhận
      </div>
      
      <button style={{
        position: 'absolute',
        top: 75,
        right: -7, 
        width: 111,
        height: 32,
        background: '#9C9C9C', 
        borderTopLeftRadius: 31.50, 
        borderBottomLeftRadius: 31.50,
        color: 'white', 
        fontSize: 17, 
        fontFamily: 'Montserrat', 
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer'
      }}>
        Hủy đặt
      </button>
      
      <button style={{
        position: 'absolute',
        width: 80,
        height: 16,
        top: 116,
        fontSize: 13, 
        fontFamily: 'Montserrat', 
        fontWeight: '500',
        right: 10,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: '#333'
      }}>
        Xem chi tiết
      </button>
    </>
  );
}

// Separate component for Other Status
function OtherStatus({ statusText, statusBg }) {
  return (
    <div style={{
      position: 'absolute',
        width: 217,
        height: 114,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      top: 13,
      right: -15
    }}> 
        {/* Background Image */}
      <img 
        src={SuccessBookingbg}
        alt="status background" 
        style={{
          position: 'absolute',
          objectFit: 'cover',
        }}
      />

      {/* Text on top */}
      <span style={{ 
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        position: 'relative',
        zIndex: 1
      }}>
        {statusText}
      </span>
    </div>
  );
}

function HotelCard({ 
  image, 
  name, 
  rating, 
  location, 
  checkIn, 
  checkOut, 
  status 
}) {
  // Status can be: 'confirmed' (green), 'success' (red), 'cancelled' (black), 'pending' (gray)
  const getStatusStyle = () => {
    switch(status) {
      case 'confirmed':
        return { bg: '#00C851', text: 'Đã xác nhận' };
      case 'success':
        return { bg: '#DC143C', text: 'Đã thành công' };
      case 'cancelled':
        return { bg: '#000000', text: 'Đã Hủy' };
      default:
        return { bg: '#808080', text: 'Hủy đặt' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div style={{
      display: 'flex',
      backgroundColor: 'rgba(239, 238, 238, 1)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '15px',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      height: '140px',
      position: 'relative'
    }}>
      {/* Black overlay for the whole card (except status button) */}
      {(status === 'success' || status === 'cancelled') && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: '160px',
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      )}
      
      {/* Hotel Image */}
      <div style={{
        width: '300px',
        minWidth: '220px',
        overflow: 'hidden',
        position: 'relative'
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
      </div>

      {/* Hotel Info */}
      <div style={{
        left: 313,
        position: 'absolute',
      }}>
        <div>
          <h3 style={{
            fontSize: 24, 
            fontFamily: 'Montserrat', 
            fontWeight: '800',
            width: 330,
            height: 20
          }}>
            {name}
          </h3>
          
          {/* Star Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '2px', position: 'absolute', top: 34}}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: i < rating ? 'rgba(255, 204, 0, 1)' : '#DDD', fontSize: '16px' }}>
                  ★
                </span>
              ))}
            </div>
            <span style={{
              fontSize: '13px',
              color: '#666',
              borderLeft: '1px solid #ddd',
              paddingLeft: '8px',
              position: 'absolute',
              top: 37,
              left: 80
            }}>
              {location}
            </span>
          </div>
        </div>

        {/* Date Badge */}
        <div style={{
          backgroundColor: 'rgba(173, 0, 0, 1)',
          color: 'white',
          padding: '4px 12px',
          borderTopRightRadius: 19.50, 
          borderBottomRightRadius: 19.50,
          display: 'inline-block',
          alignSelf: 'flex-start',
          position: 'absolute',
          top: 70,
          left: -13,
          width: "220px",
          height: '32px',
          fontSize: 13, 
          fontFamily: 'Montserrat', 
          fontWeight: '500',
          justifyContent: 'center'
        }}>
          T{checkIn} - T{checkOut}
        </div>
      </div>

      {/* Status Section */}
      <div style={{
        width: '160px',
        minWidth: '160px',
        backgroundColor: status === 'confirmed' ? 'white' : statusStyle.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 650,
        zIndex: 2
      }}>
        {status === 'confirmed' ? (
          <ConfirmedStatus />
        ) : (
          <OtherStatus statusText={statusStyle.text} statusBg={statusStyle.bg} />
        )}
      </div>
    </div>
  );
}

// Example usage with multiple hotels
export default function HotelBookingList() {
  const [bookings, setBookings] = React.useState([]);
  React.useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => setBookings(data))
    .catch((err) => console.error("Error loading bookings:", err));
}, []);

  

  return (
    <div style={{
        position: 'absolute',
        top: 40,
        left: 31,
        padding: '20px',
        backgroundColor: '#ffffffff',
        height: '1150px',
        width: "867px",
        display: 'flex',
        flexDirection: 'column'
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '10px'
      }}>
        {bookings.map(b => (
  <HotelCard
    key={b.booking_id}
    image={b.accommodation_image}
    name={b.accommodation_title}
    rating={4} 
    location={b.accommodation_location}
    checkIn={b.date_start}
    checkOut={b.date_end}
    status={b.status}
  />
))}
      </div>  
    </div>    
  );           
}    