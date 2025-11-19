import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT CÁC TRANG (PAGES) ---
import SignIn from './pages/SignInPage.jsx';
import SignUp from './pages/SignUpPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SearchingPage from './pages/SearchingPage.jsx';

// Trang Profile đã gộp (Dùng chung cho cả Owner và Traveller)
import UserProfile from './pages/UserProfile.jsx';

// Các trang chức năng khác
import AddAccommodationForm from './pages/AddAccommodationForm.jsx';
import BookingDetailPage from './pages/Booking.jsx';
import BookingConfirmPage from './pages/BookingConfirmPage.jsx';
import BookingFormPage from './pages/BookingFormPage.jsx';
import ModifyAccommodationForm from './pages/ModifyAccommodationForm.jsx';

export default function App() {
  return (
    <div className="app-container">
      {/* Nếu muốn có Navbar hiển thị Ở TẤT CẢ CÁC TRANG, hãy đặt nó ở đây */}
      {/* <Navbar /> */}

      <Routes>
        {/* --- Auth & Home --- */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<LandingPage />} />
        
        {/* --- Search --- */}
        <Route path="/search" element={<SearchingPage />} />
        
        {/* --- Profile --- */}
        <Route path="/profile" element={<UserProfile />} />
        
        {/* Redirect các link cũ để tránh lỗi */}
        <Route path="/profilet" element={<Navigate to="/profile" replace />} />
        <Route path="/profileo" element={<Navigate to="/profile" replace />} />

        {/* --- Booking & Accommodation Management --- */}
        <Route path="/AddAccommodationForm" element={<AddAccommodationForm/>} />
        <Route path="/booking" element={<BookingDetailPage/>} />
        <Route path="/confirm" element={<BookingConfirmPage/>} />
        <Route path="/formpage" element={<BookingFormPage/>} />
        <Route path="/modify-accommodation/:id" element={<ModifyAccommodationForm/>} />        
        {/* Route 404 (Tùy chọn: Bắt các link sai) */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}