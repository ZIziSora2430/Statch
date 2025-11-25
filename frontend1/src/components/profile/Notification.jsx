import { CheckCircle, AlertCircle} from "lucide-react"; 

function Notification({ show, message, type, onClose }){
    if (!show) return null;

    const isSuccess = type === 'success';
    // Style cho thông báo
    const notifyStyle = {
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999, // Luôn nổi lên trên cùng
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: isSuccess ? '6px solid #4CAF50' : '6px solid #F44336', // Màu cạnh trái
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out'
    };
    return (
        <>
        <div style={notifyStyle}>
            {/* Icon */}
            {isSuccess ? (
                <div style={{ color: '#4CAF50' }}><CheckCircle/></div> 
            ) : (
                <div style={{ color: '#F44336' }}><AlertCircle/></div>
            )}
            
            {/* Nội dung */}
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#333' }}>
                    {isSuccess ? 'Thành công' : 'Thông báo'}
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>{message}</p>
            </div>

            {/* Nút đóng */}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 18 }}>
                ✕
            </button>
        </div>
        </>
    );
}

export default Notification; 