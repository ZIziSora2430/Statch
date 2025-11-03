import logo from '../images/Logo.png';
import Bell from '../images/Bell.png';
import Avatar from '../images/Avatar.png';
export default function Navbar() {
  return (
    <nav className="bg-[linear-gradient(to_bottom,#DF3C48,#A01923)] text-white h-[488px]">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
               <a href="/">
          <img src={logo} alt="MyBrand Logo" className="h-[58px] w-[32,59px]" />
        </a>
        <ul className="flex gap-6">
          <li>
            <a href="#Bell">
              <img src={Bell} alt="Bell" className="h-8 w-8 hover:opacity-80" />
            </a>
          </li>
          <li>
            <a href="signup">
              <img src={Avatar} alt="Avatar" className="h-8 w-8 hover:opacity-80" />
            </a>
          </li>
        </ul>
         <p className="absolute top-0 left-53 text-[36px] font-bold text-white-600">
    tatch
  </p>
        <p className="absolute top-40 left-46 text-[64px] font-bold text-white-600">
    Kế tiếp bạn sẽ du lịch <br />
    đến đâu?
  </p>
      </div>
    </nav>
  );
}
