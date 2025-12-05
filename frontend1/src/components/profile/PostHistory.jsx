import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockPostHistory } from "../../pages/dataHistory.jsx";
import PostCard from "../Postcard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("access_token");

  useEffect(() => {
      const fetchMyPost = async () => {
        const token = getToken(); 
        if(!token) return; 

        try{
          const response = await fetch(`${API_URL}/posts/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if(response.ok){
            const data = await response.json(); 
            setPosts(data);
          } else {
            console.log("Không thể fetch dữ liệu");
          }
        }
        catch (error){
          console.log("Lỗi tải lịch sử post: ", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyPost(); 
  }, [])


  const convertToPostCardFormat = (post) => ({
    author: {
      username: post.author?.username || "Bạn",
      is_verified_traveler: post.author?.is_verified_traveler || false,
    },
    created_at: post.created_at, 
    location: post.location, 
    title: post.title,
    content: post.content,
    views_count: post.views_count,
    replies_count: post.replies_count,
    status: post.status
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Đang tải lịch sử đăng bài...
      </div>
    );
  }

  return (
    <div 
    style={{ 
      maxHeight: 980,
      overflow: 'auto'
    }}
    className="w-full px-6 md:px-10 pb-10 pt-2 relative -mt-[55px]">

      {/* Title */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="w-1.5 h-8 bg-[#AD0000] rounded-full"></div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Lịch sử đăng bài</h1>
      </div>
      <div className="flex flex-col gap-4 pr-4"> 
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Bạn chưa đăng bài viết nào trong diễn đàn.</p>
            <button 
                onClick={() => navigate("/community")}
                className="px-4 py-2 bg-[#AD0000] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#850000] transition"
            >
                Đăng bài ngay
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              className="no-underline text-black"
            >
              {/* Giữ scale và thêm margin âm (mb-[-1.25rem]) để bù trừ khoảng trống do scale-[0.95] gây ra, giúp các card sát nhau và container bao được hết nội dung. */}
              <div className="scale-[0.95] transform origin-top-left -mb-5">
                <PostCard post={convertToPostCardFormat(post)} />
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}