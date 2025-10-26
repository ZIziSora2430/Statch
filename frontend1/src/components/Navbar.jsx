import { useState } from "react";


function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const ToggleDropDown = () => {

        setIsDropdownOpen(isDropdownOpen ? false: true);
    }

  return (
    <nav className="bg-white border-b border-gray-200 ">
      <div className="max-w-7xl flex items-center justify-end mx-auto px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-[#E00001]">
            Statch
          </span>
       </div>

                {/* Menu Items */}
        <ul className="flex items-center space-x-8 ml-auto mr-8">
          <li>
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium"></a>
            <img src="./src/images/chat.png" className="w-6 h-6"></img>
          </li>
          <li>
            <a href="#" className="text-black hover:text-blue-400 font-medium"></a>
            <img src="./src/images/file.png" className="w-6 h-6"></img>
          </li>
          <li>
            <a href="#" className="text-black hover:text-blue-400 font-medium"></a>
            <img src="./src/images/notification.png" className="w-6 h-6"></img>
          </li>
          <li>
            <a href="#" className="text-black hover:text-blue-400 font-medium"></a>
            <img src="./src/images/logout.png" className="w-6 h-6"></img>

          </li>
          
        </ul>

         <div className="relative">
          <button onClick={ToggleDropDown}
                  className="flex items-center space-x-2 focus:outline-none">
            <svg className="w-8 h-8 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" alt="User avatar">
              <path fillrule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" cliprule="evenodd"/>
            </svg>
          </button>
         

         {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Dashboard
                </a>
                <div className="border-t border-gray-200"></div>
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            )}
          </div>
         <div/>
      </div>
    </nav>
  );
}

export default Navbar;