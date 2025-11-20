// Hàm tìm tọa độ từ địa chỉ (Forward)
export const geocodeAddress = async (address) => {
    if (!address) return null;
    try {
        // Thêm &limit=1 để lấy kết quả chính xác nhất
        // `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&accept-language=vi`;
        const response = await fetch(
            url
        );
        const data = await response.json(); 
        if (data && data.length > 0) {
            return { 
                lat: parseFloat(data[0].lat), 
                lng: parseFloat(data[0].lon),
                display_name: data[0].display_name 
            };
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    return null;
};

// Hàm tìm địa chỉ từ tọa độ (Reverse)
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return data.display_name; // Địa chỉ đầy đủ
    } catch (error) {
        console.error("Reverse Geocoding error:", error);
        return "";
    }
};