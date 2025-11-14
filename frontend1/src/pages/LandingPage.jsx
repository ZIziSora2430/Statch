import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ImageFrame from "../components/ImageFrame";
import Promo from "../components/PromotionCarousel";
import Banner from "../components/Banner";
import ConDao from "../images/Con-Dao.jpg";
import HaNoi from "../images/Ha-Noi.jpg";  
import CanTho from "../images/Can-Tho.jpg";
import HoiAn from "../images/Hoi-An.jpg";
import TPHCM from "../images/TPHCM.jpg";
import React, { useState, useEffect } from "react"; 




export default function LandingPage() {

  const [currentUserName, setCurrentUserName] = useState("bạn");
  useEffect(() => {
    // Tên người dùng được lưu trong SignInPage.jsx với key là "username"
    const storedUsername = localStorage.getItem("username"); 
    
    if (storedUsername) {
      // Cập nhật state nếu tìm thấy tên
      setCurrentUserName(storedUsername);
    }
  }, []);

  return (
    <div>
      <Navbar />
      <Banner username={currentUserName}/>

      <main className="mx-auto w-[92%] sm:w-11/12 max-w-7xl pt-16">
      <div className="md:mb-8 lg:mb-10">
        <SearchingBar />
      </div>

      {/* main xếp theo cột */}
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-4">
         <p className="mb-6 ml-13 text-black text-4xl font-bold text-left">
   Điểm đến thịnh hành
  </p>
        {/* HÀNG TRÊN: 2 ảnh to */}
        <div className="flex justify-center gap-3">
          <ImageFrame
            src={ConDao}
            alt="Côn Đảo"
            ratio="21/9"
            rounded="xl"
            shadow="lg"
            className="w-[45%]"
          />
          <ImageFrame
            src={HaNoi}
            alt="Hà Nội"
            ratio="21/9"
            rounded="xl"
            shadow="lg"
            className="w-[45%]"
          />
        </div>

        {/* HÀNG DƯỚI: 3 ảnh nhỏ hơn */}
   <div className="flex flex-nowrap justify-center gap-1.5 w-full">
          <ImageFrame
            src={TPHCM}
            alt="Thành Phố Hồ Chí Minh"
            ratio="21/9"
            rounded="xl"
            shadow="md"
            className="w-full sm:w-[30%]"  /* nhỏ hơn hàng trên */
          />
          
          <ImageFrame
            src={HoiAn}
            alt="Hội An"
            ratio="21/9"
            rounded="xl"
            shadow="md"
            className="w-full sm:w-[30%]"
          />
          <ImageFrame
            src={CanTho}
            alt="Cần Thơ"
            ratio="21/9"
            rounded="xl"
            shadow="md"
            className="w-full sm:w-[30%]"
          />
        </div>
         <p className="mt-9  text-black text-4xl font-bold text-center">
   Ưu đãi hôm nay
  </p>
   <div >
      <Promo />
      </div>
      </div>
      </main>
      <footer className="bg-gray-900 text-gray-300 py-6 mt-10 text-center">
  <div className="container mx-auto">
    <p className="text-sm">
      © 2025 Statch. All rights reserved.
    </p>
    <div className="mt-2 flex justify-center gap-4">
      <a href="#" className="hover:text-white transition">Về chúng tôi</a>
      <a href="#" className="hover:text-white transition">Liên hệ</a>
      <a href="#" className="hover:text-white transition">Điều khoản</a>
    </div>
  </div>
</footer>
    </div>
  );
}
