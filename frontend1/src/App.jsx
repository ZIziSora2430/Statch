import Navbar from "./components/Navbar";
import SearchingBar from "./components/SearchingBar";

export default function App() {
  return (
    <div>
      <SearchingBar />
      <main className="p-6">
        <p>Đây là phần nội dung chính của trang</p>
      </main>
    </div>
  );
}     
