import Navbar from "../components/Navbar";
import Avatar from "../images/Avatar.png";
import TravellerProfilebg from "../images/ProfileAvaterbg.png"
import OriAvatar from "../images/OriAvatar.png"
import DefaultAvatar from "../images/avatar-default.svg"
import { useState } from "react";
import Profilebg from "../images/profilebg.svg"
import Secprofilebg from "../images/2ndprofilebg.svg"
import HotelBookingList from "../components/ReservationHis";
import ChangePass from "../components/SettingChangePass"

export default function TravellerProfile() {
    const hasAvatar = false;
    const userAvatar = hasAvatar ? OriAvatar : DefaultAvatar; // Avatar placeholer helper
    const ID = "24127234"; // take data from user
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUsername] = useState("Sumimasen")  // take data from user 
    const [fullName, setFullName] = useState("Nguyen Duc Nhat Phat"); // take data from user 
    const [activeSection, setActiveSection] = useState()
    const isOwner = false; // take data from user
    const role = isOwner ? "Người cho thuê" : "Người thuê";
    const [sex, setSex] = useState("nam")
    const [day, setDay] = useState("1");
    const [month, setMonth] = useState("1");
    const [year, setYear] = useState("2000");
    const [city, setCity] = useState("DATA TU USER")
    const [preference, setPreference] = useState("testingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtestingtesting")
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh"  }}>
      <Navbar />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0, height: "1050px"}}>
            <img
            src={Profilebg}
            alt="Profile background"
            style={{
                width: "100%",
                position: "absolute",
                bottom: -300,
                left: 0,
                zIndex: 0,
            }}
            />
            <img
            src={Secprofilebg}
            alt="Second background"
            style={{
                width: "100%",
                position: "absolute",
                bottom: -300, // adjust this overlap
                left: 0,
                zIndex: 0,
            }}
            />
        </div>
      {/* Centered content frame */}
      <div
        style={{
          width: 1440,
          margin: "0 auto",           // centers the 1440px frame horizontally
          position: "relative",
          minHeight: "calc(100vh - 75px)",
          background: "white",        // optional: helps visualize your frame
          borderRadius: 12,
          zIndex: 1
        }}
      >
        {/* Red Square on the left */}
        <div style={{
            width: 463,
            height: 538,
            position: "relative",
            top: 100,
            left: 18,
            background: "#AD0000",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <img src={TravellerProfilebg} alt="Profile Gradient Background" style={{zIndex: 0}}/>

          {/* Avatar */}
          <div style={{ 
                position: "absolute",
                top: 27,
                right: 169,
                left: 177,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "white", // background circle
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            }}>
            <img
            src={userAvatar}
            alt="Avatar"
            style={{
                width: 117,
                height: 117,
                borderRadius: "50%",
                objectFit: "cover",
            }}
            />
            </div>

            {/* Username box */}
            <h1
                style={{
                    position: "absolute",
                    top: 162,
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: "Montserrat",
                    fontWeight: "700",
                    color: "white",
                    letterSpacing: 1.25,
                }}
            >
                {userName}
            </h1>

            <div style={{ 
                position: "absolute", 
                height: '1px', 
                backgroundColor: '#ffffffff', 
                width: '100%',
                bottom: 319
            }}/>

            {/* SWICHES HERE */}
            <div style={{
                alignItems: 'flex-start'
            }}>
                <div
                style={{
                    position: "absolute",
                    top:
                    activeSection === "info"
                        ? 235
                        : activeSection === "history"
                        ? 300
                        : activeSection === "statusPost"
                        ? 365
                        : 440,
                    left: 15,
                    width: 420,
                    height: 55,
                    borderRadius: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.95)", // light box
                    transition: "top 0.3s ease",
                }}
                ></div>

                <button 
                onClick={() => setActiveSection('info')}
                style={{
                    position: "absolute",
                    top: 245,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "info" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer",
                }}>
                    Thông tin cá nhân
                </button>

                <button 
                onClick={() => setActiveSection('history')} 
                style={{
                    position: "absolute",
                    top: 310,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "history" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Chỗ đã đặt
                </button>

                <button 
                onClick={() => setActiveSection('statusPost')} 
                style={{
                    position: "absolute",
                    top: 375,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "statusPost" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Lịch sử đặt bài
                </button>

                <button 
                onClick={() => setActiveSection('setting')} 
                style={{
                    position: "absolute",
                    top: 450,
                    left: 25,
                    fontFamily: "Montserrat",
                    fontSize: 24,
                    letterSpacing: 1.20,
                    fontWeight: '700',
                    color: activeSection === "setting" ? "rgba(173, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer"
                }}>
                    Riêng tư và bảo mật
                </button>
            </div>
        </div>

        <div style={{
            width: 923,
            height: 1200,
            position: "absolute",
            top: 100,
            right: 23,
            background: "#ffffffff",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
        }}>
            {activeSection === "info" && (
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10
                    }}>
                        Thông tin cá nhân
                    </h1>

                    <div style={{
                        position: 'absolute',
                        width: 867,
                        height: 760,
                        background: 'white',
                        borderRadius: 20,
                        border: '1px #878787 solid',
                        top: 55,
                        left: 28
                    }}>
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 11,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Tên Đăng Nhập</label><br />
                            <input
                            type="text"
                            value={userName}
                            disabled={!isEditing}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 45,
                                left: 31,
                                width: '391px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                            }}
                            />
                        
                        </div>
                            
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 11,
                                left: 445,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>ID người dùng</label><br />
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 45,
                                left: 445,
                                width: '391px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: '#f0f0f0',
                                border: 'none',
                                color: '#878787'
                            }}>{ID}</h1>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 108,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Họ và tên</label><br />
                            <input
                            type="text"
                            value={fullName}
                            disabled={!isEditing}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 142,
                                left: 31,
                                width: '805px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                            }}
                            />
                        </div>
                        
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Giới tính</label><br />
                            <select
                            type="text"
                            value={sex}
                            disabled={!isEditing}
                            onChange={(e) => setSex(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 239,
                                left: 31,
                                width: '122px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                cursor: isEditing ? 'pointer' : 'default',
                            }}>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="undisclosed">Không muốn tiết lộ</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 187,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Vai trò</label><br />
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 239,
                                left: 187,
                                width: '148px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: '#f0f0f0',
                                border: 'none',
                                color: '#878787'
                            }}>{role}</h1>
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 206,
                                left: 377,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Ngày sinh</label><br />
                            <div style={{ 
                                position: 'absolute',
                                display: 'flex',
                                gap: '15px',
                                top: 239,
                                left: 377,
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                
                                }}>
                                <select
                                    value={day}
                                    disabled={!isEditing}
                                    onChange={(e) => setDay(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '122px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <select
                                    value={month}
                                    disabled={!isEditing}
                                    onChange={(e) => setMonth(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '122px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    <option value="1">Tháng 1</option>
                                    <option value="2">Tháng 2</option>
                                    <option value="3">Tháng 3</option>
                                    <option value="4">Tháng 4</option>
                                    <option value="5">Tháng 5</option>
                                    <option value="6">Tháng 6</option>
                                    <option value="7">Tháng 7</option>
                                    <option value="8">Tháng 8</option>
                                    <option value="9">Tháng 9</option>
                                    <option value="10">Tháng 10</option>
                                    <option value="11">Tháng 11</option>
                                    <option value="12">Tháng 12</option>
                                </select>
                                <select
                                    value={year}
                                    disabled={!isEditing}
                                    onChange={(e) => setYear(e.target.value)}
                                    style={{
                                    borderRadius: 10,
                                    width: '185px',
                                    padding: '5px',
                                    backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                    border: isEditing ? '1px solid #ccc' : 'none',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    }}
                                >
                                    {[...Array(100)].map((_, i) => {
                                    const y = 2025 - i;
                                    return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 300,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Thành phố cư trú</label><br />
                            <input
                            type="text"
                            value={city}
                            disabled={!isEditing}
                            onChange={(e) => setCity(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 336,
                                left: 31,
                                width: '805px',
                                height: '42px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                            }}
                            />
                        </div>

                        <div>
                            <label style={{
                                position: 'absolute',
                                top: 400,
                                left: 31,
                                color: '#878787', 
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1
                            }}>Sở thích cá nhân</label><br />
                            <textarea
                            value={preference}
                            disabled={!isEditing}
                            onChange={(e) => setPreference(e.target.value)}
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 433,
                                left: 31,
                                width: '805px',
                                height: '211px',
                                padding: '5px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? 'white' : '#f0f0f0',
                                border: isEditing ? '1px solid #ccc' : 'none',
                                resize: 'none',            // prevent manual resizing
                                whiteSpace: 'pre-wrap',    // ensures line breaks and wrapping
                                overflowWrap: 'break-word' // breaks long words if needed
                            }}
                            />
                        </div>
                        
                        <button
                        onClick={() => setIsEditing(!isEditing)}>
                            <h1
                            style={{
                                position: 'absolute',
                                fontSize: 20, 
                                fontFamily: 'Montserrat', 
                                fontWeight: '700', 
                                letterSpacing: 1,
                                top: 680,
                                left: 588,
                                width: '248px',
                                height: '46px',
                                padding: '8px',
                                borderRadius: 10,
                                backgroundColor: isEditing ? '#ffffffff' : 'rgba(201, 0, 0, 1)',
                                border: 'none',
                                color: isEditing ? 'rgba(201, 0, 0, 1)' : '#ffffffff',
                                cursor: 'pointer',
                                boxShadow: isEditing ? '0px 4px 10px rgba(0, 0, 0, 0.25)' : 'none'
                            }}>{isEditing ? "Lưu chỉnh sửa" : "Chỉnh sửa thông tin" }</h1>
                        </button>

                        <div style={{ fontFamily: "Montserrat", width: 600 }}>
                            {/* EMAIL SECTION */}
                            <div
                                style={{
                                position: 'absolute',
                                border: '1px #878787 solid',
                                borderRadius: 12,
                                padding: "16px 20px",
                                top: 780,
                                left: 0,
                                width: 867
                                }}
                            >
                                <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                >
                                    <div>
                                        <h3
                                        style={{
                                            margin: 0,
                                            fontSize: 18,
                                            fontWeight: 700,
                                        }}
                                        >
                                        Email đã liên kết
                                        </h3>
                                        <p
                                        style={{
                                            margin: 0,
                                            color: "#999",
                                            fontSize: 14,
                                            fontWeight: 500,
                                        }}
                                        >
                                        Mỗi tài khoản chỉ liên kết được với một email
                                        </p>
                                    </div>

                                    <button
                                        style={{
                                        border: "1px solid black",
                                        backgroundColor: "white",
                                        borderRadius: 8,
                                        padding: "8px 16px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        }}
                                        onClick={() => {
                                        const newEmail = prompt("Nhập email mới:");
                                        if (newEmail) setEmail(newEmail);
                                        }}
                                    >
                                        Thay đổi email
                                    </button>
                                </div>

                                {/* Appears only when email exists */}
                                {email && (
                                <div
                                    style={{
                                    marginTop: 10,
                                    paddingTop: 10,
                                    borderTop: '1px #878787 solid',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    }}
                                >
                                    {email}
                                </div>
                                )}
                            </div>

                            {/* PHONE SECTION */}
                            <div
                            style={{
                            position: 'absolute',
                            top: 930,
                            left: 0,
                            border: '1px #878787 solid',
                            borderRadius: 12,
                            padding: "16px 20px",
                            width: 867
                            }}
                            >
                                <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                >
                                    <div>
                                        <h3
                                        style={{
                                            margin: 0,
                                            fontSize: 18,
                                            fontWeight: 700,
                                        }}
                                        >
                                        Số di động
                                        </h3>
                                        <p
                                        style={{
                                            margin: 0,
                                            color: "#999",
                                            fontSize: 14,
                                            fontWeight: 500,
                                        }}
                                        >
                                        Mỗi tài khoản chỉ được thêm tối đa 1 số di động
                                        </p>
                                    </div>

                                <button
                                    style={{
                                    border: "1px solid black",
                                    backgroundColor: "white",
                                    borderRadius: 8,
                                    padding: "8px 16px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    }}
                                    onClick={() => {
                                    const newPhone = prompt("Nhập số di động:");
                                    if (newPhone) setPhone(newPhone);
                                    }}
                                >
                                    Thêm số di động
                                </button>
                                </div>

                                {/* Appears only when phone exists */}
                                {phone && (
                                <div
                                    style={{
                                    marginTop: 10,
                                    paddingTop: 10,
                                    borderTop: '1px #878787 solid',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    }}
                                >
                                    {phone}
                                </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeSection === "history" && (
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10,
                        zIndex: 1
                    }}>
                        Chỗ đã đặt
                    </h1>
                    <HotelBookingList style={{zIndex: 0}}/>
                </div>
            )}

            {activeSection === "statusPost" && (
                <div>
                    
                </div>
            )}
            
            {activeSection === "setting" && (
                
                <div>
                    <h1 style={{
                        fontSize: 24, 
                        fontFamily: 'Montserrat', 
                        fontWeight: '700', 
                        letterSpacing: 1.20,
                        color: 'rgba(173, 0, 0, 1)',
                        position: 'absolute',
                        left: 19,
                        top: 10,
                        zIndex: 1
                    }}>
                        Riêng tư và bảo mật
                    </h1>
                    <ChangePass/>
                </div>
                
            )}
        </div>

      </div>
    </div>
  );
}
