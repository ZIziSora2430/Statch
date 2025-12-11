function SidebarBtn({ label, active, onClick }){
    return (
        <>
        <div 
        onClick={onClick}
        className="group relative h-[55px] cursor-pointer"
        style={{ position: 'relative', height: 55 }}
    >        <div 
            className={`absolute -left-2.5 w-[420px] h-[55px] rounded-[10px] bg-white/95 transition-all duration-300 ease-out origin-left ${
                active ? 'opacity-100 scale-x-100 translate-x-0' : 'opacity-0 scale-x-90 -translate-x-2'
            }`}
            style={{ 
                position: 'absolute', left: -10, width: 420, height: 55, borderRadius: 10, background: 'rgba(255,255,255,0.95)',
                opacity: active ? 1 : 0,
                transform: active ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
        />
        
        {/* Chữ */}
        <button 
            style={{ 
                position: 'absolute', left: 20, top: 10, 
                fontSize: 24, fontWeight: '700', 
                background: 'none', border: 'none', cursor: 'pointer',
                // Transition màu chữ
                color: active ? '#AD0000' : 'white',
                transition: 'color 0.3s ease'
            }}
            // Thêm hiệu ứng hover nhẹ
            className={`text-left transition-colors duration-300 ${!active && 'group-hover:text-gray-200'}`}
        >
            {label}
        </button>
        </div>
        </>
    );
}

export default SidebarBtn;