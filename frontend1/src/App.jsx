import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUpPage";
import SearchingBar from "./components/SearchingBar";

export default function App() {
  return (
    <div>
      <Navbar />
      <SearchingBar/>
      <main className="p-6">
        <p>Đây là phần nội dung chính của trang</p>
      </main>
    </div>
  );
}     
