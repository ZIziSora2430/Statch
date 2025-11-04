import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ImageFrame from "../components/ImageFrame";

import ConDao from "../images/Con-Dao.jpg";
import HaNoi from "../images/Ha-Noi.jpg";      // nên tránh dấu & khoảng trắng trong tên file
import CanTho from "../images/Can-Tho.jpg";
import HoiAn from "../images/Hoi-An.jpg";
import TPHCM from "../images/TPHCM.jpg";

export default function App() {
  return (
    <div>
      <Navbar />
      <div>
        <SearchingBar />
      </div>

      {/* main xếp theo cột */}
      <main className="p-6 max-w-6xl mx-auto flex flex-col gap-4">
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
         <p className="mt-9 ml-13 text-black text-4xl font-bold text-center">
   Ưu đãi hôm nay
  </p>
      </main>
    </div>
  );
}
