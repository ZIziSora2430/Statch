const validateInput = (phone, email) => {
    // 1. Kiểm tra Số điện thoại
    // Chỉ chứa chữ số, dài 10 số
    const simplePhoneRegex = /^[0-9]{10}$/;

    if (!simplePhoneRegex.test(phone)) {
        return "Số điện thoại không hợp lệ";
    }

    // 2. Kiểm tra Gmail
    // Regex: Bắt buộc kết thúc bằng @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
    if (!gmailRegex.test(email)) {
        return "Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: abc@gmail.com).";
    }

    return null; // Không có lỗi
};

export default validateInput; 