import React from 'react';
import { useNavigate } from "react-router-dom";

export default function Community() {
    const navigate = useNavigate(); 
    return(
    <div className="flex justify-center mt-8" onClick={() => navigate("/community")}> 
      <button className="bg-[#BF1D2D] hover:bg-[#881818] text-white font-bold py-3 px-16 rounded-lg transition duration-200 ease-in-out cursor-pointer" > 
        Tham gia cộng đồng
      </button>
    </div>
    )
}