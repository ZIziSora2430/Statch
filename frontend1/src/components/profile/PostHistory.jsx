import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mockPostHistory } from "../../pages/dataHistory.jsx";
import PostCard from "../Postcard.jsx";

export default function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockPostHistory);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const convertToPostCardFormat = (post) => ({
    author: {
      username: post.username,
      is_verified_traveler: false,
    },
    created_at: post.time,
    category: post.location,
    title: post.title || "Bài đăng",
    content: post.content,
    views_count: post.likes,
    replies_count: post.comments,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Đang tải lịch sử đăng bài...
      </div>
    );
  }

  return (
    <div className="w-full h-auto px-6 md:px-10 pb-10 pt-0 relative -mt-[55px]">

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 bg-[#AD0000] rounded-full shrink-0"></div>
        <h1 className="text-2xl font-bold text-gray-800">
          Lịch sử đăng bài
        </h1>
      </div>
      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-4"> 
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Chưa có bài đăng nào.
          </div>
        ) : (
          posts.map((post) => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              className="no-underline text-black"
            >
              {/* Giữ scale và thêm margin âm (mb-[-1.25rem]) để bù trừ khoảng trống do scale-[0.95] gây ra, giúp các card sát nhau và container bao được hết nội dung. */}
              <div className="scale-[0.95] transform origin-top-left mb-[-1.25rem]">
                <PostCard post={convertToPostCardFormat(post)} />
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}