import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { MOCK_POSTS } from './data.jsx'; 
import Navbar from "../components/Navbar.jsx";
import PostCard from '../components/Postcard.jsx'; 
import Avatar from '../images/Avatar.png'; 
import { ArrowBigRight } from 'lucide-react';

function PostDetailPage() {
  const { id } = useParams();
  const postId = parseInt(id, 10); 
  const post = MOCK_POSTS.find(p => p.id === postId);

  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  
  const isVerified = true;

  if (!post) {
    // ... (phần code 404 giữ nguyên)
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold">Lỗi 404</h1>
          <p>Không tìm thấy bài viết.</p>
          {/* Link này đã được đổi ở yêu cầu trước */}
          <Link to="/community" className="text-blue-500 hover:underline mt-4 inline-block">
            &larr; Quay lại
          </Link>
        </div>
      </div>
    );
  }

  // MỚI: Quyết định xem nên hiển thị bao nhiêu bình luận
  // Nếu showAllComments là true, hiển thị tất cả.
  // Nếu showAllComments là false, chỉ hiển thị 3 bình luận đầu tiên.
  const commentsToShow = showAllComments 
    ? post.commentDetails 
    : post.commentDetails.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 pt-18 pb-6">
        {/* Link này đã được đổi ở yêu cầu trước */}
        <div className="mb-4">
          <Link to="/community" className="text-gray-600 hover:text-black hover:underline">
            &larr; Quay lại
          </Link>
        </div>

        <PostCard post={post} />

        <div className="bg-white rounded-lg shadow-md mt-4 p-5">
          <h3 className="text-lg font-semibold mb-4">
            Bình luận ({post.comments})
          </h3>
          
          {/* --- HIỂN THỊ BÌNH LUẬN (ĐÃ CẬP NHẬT) --- */}
          <div className="flex flex-col gap-4">
            {post.commentDetails.length > 0 ? (
              // MỚI: Lặp qua 'commentsToShow' thay vì 'post.commentDetails'
              commentsToShow.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img 
                    src={Avatar}
                    alt="avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="bg-gray-100 rounded-lg p-3 flex-1">
                    <p className="font-semibold text-sm">{comment.user}</p>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có bình luận nào.</p>
            )}
          </div>
          
          {/* --- MỚI: NÚT "HIỆN THÊM BÌNH LUẬN" --- */}
          {/* Nút này chỉ hiện khi:
              1. Có nhiều hơn 3 bình luận
              2. Người dùng CHƯA bấm xem tất cả (showAllComments là false)
          */}
          {post.commentDetails.length > 3 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-gray-500 hover:underline mt-4 text-sm font-medium cursor-pointer"
            >
              Hiện thêm bình luận
            </button>
          )}

          
          {/* --- KHUNG VIẾT BÌNH LUẬN (giữ nguyên từ lần trước) --- */}
          {isVerified && (
          <div className="mt-6 flex gap-3 items-start">
            <img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
            <input 
              type="text" 
              placeholder="Viết bình luận..." 
              className="bg-gray-100 rounded-lg px-4 py-2 focus:outline-none flex-1"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <ArrowBigRight 
              className={`cursor-pointer mt-2 ml-1 ${
                commentText ? 'text-black' : 'text-gray-400'
              }`}
              size={24} 
            />
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PostDetailPage;