import Navbar from "../components/Navbar";
import SearchingBar from "../components/SearchingBar";
import ImageFrame from "../components/ImageFrame";
import condao from "../images/Con-Dao.jpg";
import Hanoi from "../images/Hà Nội.jpg";

export default function App() {
  return (
     <div>
      <Navbar />
      <div>
        <SearchingBar />
      </div>
     <main className="p-6 flex justify-center gap-2">
  <ImageFrame
    src={condao}
    alt="Côn Đảo"
    ratio="16/9"
    rounded="xl"
    shadow="lg"
    className="w-[40%]"
  />
  <ImageFrame
    src={Hanoi}
    alt="Hà Nội"
    ratio="16/9"
    rounded="xl"
    shadow="lg"
    className="w-[40%]"
  />
</main>


    </div>
  );
}     