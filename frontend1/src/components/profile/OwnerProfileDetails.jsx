import { useState } from "react";

export default function OwnerProfileDetails() {
    const [userName, setUsername] = useState("");
    const [ID, setID] = useState("");
    const [fullName, setFullName] = useState("");
    const [sex, setSex] = useState("male");
    const [day, setDay] = useState(1);
    const [month, setMonth] = useState(1);
    const [year, setYear] = useState(2000);
    const [city, setCity] = useState("");
    const [role, setRole] = useState("user");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    

    return (
        <div>
            <h1 style={{
                fontSize: 24, 
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
                position: 'relative',
                width: 867,
                height: 490,
                background: 'white',
                borderRadius: 20,
                border: '1px #878787 solid',
                top: 60,
                left: 0,
                paddingBottom: "140px",
            }}>
                <div>
                    <label style={{
                        position: 'absolute',
                        top: 11,
                        left: 31,
                        color: '#878787', 
                        fontSize: 20, 
                            
                        fontWeight: '700', 
                        letterSpacing: 1
                    }}>Tên Đăng Nhập</label><br />
                    
                    <input
                    type="text"
                    value={userName}
                    disabled={true} // Không cho phép chỉnh sửa username
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        position: 'absolute',
                        fontSize: 20, 
                        fontWeight: '700', 
                        letterSpacing: 1,
                        top: 45,
                        left: 31,
                        width: '391px',
                        height: '42px',
                        padding: '5px',
                        borderRadius: 10,
                        backgroundColor: '#f0f0f0',
                        border: 'none',
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
                            
                        fontWeight: '700', 
                        letterSpacing: 1
                    }}>ID người dùng</label><br />
                    <h1
                    style={{
                        position: 'absolute',
                        fontSize: 20, 
                            
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
                            
                        fontWeight: '700', 
                        letterSpacing: 1,
                        top: 142,
                        left: 31,
                        right: 31,
                        height: '42px',
                        padding: '5px',
                        borderRadius: 10,
                        backgroundColor: isEditing ? 'white' : '#f0f0f0',
                        border: isEditing ? '1px solid #ccc' : 'none',
                        boxSizing: 'border-box',
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
                            
                        fontWeight: '700', 
                        letterSpacing: 1
                    }}>Vai trò</label><br />
                    <h1
                    style={{
                        position: 'absolute',
                        fontSize: 20, 
                            
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
                            
                        fontWeight: '700', 
                        letterSpacing: 1,
                        top: 336,
                        left: 31,
                        right: 31,
                        height: '42px',
                        padding: '5px',
                        borderRadius: 10,
                        backgroundColor: isEditing ? 'white' : '#f0f0f0',
                        border: isEditing ? '1px solid #ccc' : 'none',
                        boxSizing: 'border-box',
                    }}
                    />
                </div>

                
                <button
                onClick={() => {
                    if (isEditing) {
                        handleSave(); // Gọi hàm lưu API
                    } else {
                        setIsEditing(true); // Bật chế độ chỉnh sửa
                    }
                }}>
                    <h1
                    style={{
                        position: 'absolute',
                        fontSize: 20, 
                        fontWeight: '700', 
                        letterSpacing: 1,
                        top: 410,
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

                {/* Nút Hủy (chỉ hiển thị khi đang edit) */}
                {isEditing && (
                    <button
                    onClick={() => setIsEditing(false)}> 
                    {/* // TODO: Nên reset lại state về giá trị ban đầu khi fetch */}
                        <h1
                        style={{
                            position: 'absolute',
                            fontSize: 20, 
                            fontWeight: '700', 
                            letterSpacing: 1,
                            top: 410,
                            left: 475, // Vị trí của nút "Chỉnh sửa" cũ
                            width: '100px',
                            height: '46px',
                            padding: '8px',
                            borderRadius: 10,
                            backgroundColor: '#ffffffff',
                            color: '#555',
                            cursor: 'pointer',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                        }}>Hủy</h1>
                    </button>
                )}

                {/* EMAIL SECTION */}
                <div
                    style={{
                    position: 'absolute',
                    border: '1px #878787 solid',
                    borderRadius: 12,
                    padding: "16px 20px",
                    top: 515,
                    left: 0,
                    width: 867,
                    boxSizing: 'border-box'
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
                            onClick={() => setIsEditing(true)} // Bật editing email
                        >
                            Thay đổi email
                        </button>
                    </div>
                        <input
                        type="email"
                        value={email}
                        disabled={!isEditing}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            marginTop: 10,
                            paddingTop: 10,
                            borderTop: '1px #878787 solid',
                            fontSize: 16,
                            fontWeight: 700,
                            width: '100%',
                            border: 'none',
                            backgroundColor: isEditing ? '#fff' : '#f0f0f0'
                        }}/>
                </div>

                {/* PHONE SECTION */}
                <div
                style={{
                position: 'absolute',
                top: 665,
                left: 0,
                border: '1px #878787 solid',
                borderRadius: 12,
                padding: "16px 20px",
                width: 867,
                boxSizing: 'border-box'
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
    );
}