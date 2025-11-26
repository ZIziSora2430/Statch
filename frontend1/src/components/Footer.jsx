function Footer(){
    return (
        <>
        <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="text-xl font-bold text-white">Statch.</div>
              <div className="flex gap-6 text-sm font-medium">
                <a href="#" className="hover:text-white transition-colors">Về chúng tôi</a>
                <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
                <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                <a href="#" className="hover:text-white transition-colors">Chính sách riêng tư</a>
              </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
             <p className="text-sm">© 2025 Statch. All rights reserved.</p>
          </div>
        </div>
      </footer>
        </>
    );
}

export default Footer; 