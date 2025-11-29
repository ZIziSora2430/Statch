// ==================== PostDetailPage.jsx ====================
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, Clock, Heart, MessageCircle, ArrowBigRight, Loader2, Trash2 } from "lucide-react";
import Avatar from '../images/Avatar.png';

// Cấu hình URL API
const API_BASE_URL = "http://localhost:8000";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

const CATEGORY_LABELS = {
  general: "Tổng hợp",
  tips: "Mẹo du lịch",
  questions: "Hỏi đáp",
  reviews: "Đánh giá",
  stories: "Câu chuyện",
};

function PostDetailPage() {
  // --- 1. LOGIC LẤY DATA (GIỮ NGUYÊN TỪ FILE API) ---
  const params = useParams();
  const postId = params.id || params.postId;
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho UI
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false); // State mới: để ẩn/hiện comment

  // Fetch Data
  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Không tìm thấy bài viết");
        throw new Error("Lỗi kết nối server");
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

const fetchVerifiedStatus = async () => {
    try {
        const token = localStorage.getItem("access_token"); // Lấy token
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/verified-status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Gửi token
            }
        });

        if (response.ok) {
            const data = await response.json();
            setIsVerified(data.is_verified);
        }
    } catch (err) {
        console.error(err);
    }
};

  // Submit Reply
const handleSubmitReply = async () => {
  if (!replyContent.trim()) return;
  setIsSubmittingReply(true);

  // 1. Lấy token từ localStorage
  const token = localStorage.getItem("access_token"); 

  if (!token) {
      alert("Bạn cần đăng nhập lại để bình luận.");
      setIsSubmittingReply(false);
      return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- QUAN TRỌNG: Thêm dòng này vào
      },
      body: JSON.stringify({ content: replyContent.trim() })
    });

    if (response.ok) {
      const newReply = await response.json();
      setReplies(prev => [...prev, newReply]);
      setReplyContent("");
      setPost(prev => ({ ...prev, replies_count: (prev.replies_count || 0) + 1 }));
    } else {
      alert("Lỗi khi gửi bình luận.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsSubmittingReply(false);
  }
};

  // Delete Reply
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/replies/${replyId}`, { method: "DELETE" });
      if (response.ok || response.status === 204) {
        setReplies(prev => prev.filter(r => r.id !== replyId));
        setPost(prev => ({ ...prev, replies_count: Math.max(0, (prev.replies_count || 0) - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([fetchPost(), fetchReplies(), fetchVerifiedStatus()]);
        setIsLoading(false);
    };
    loadData();
  }, [postId]);

  // --- 2. XỬ LÝ GIAO DIỆN (UI) GIỐNG FILE CŨ ---

  // Logic cắt comment: Nếu showAll=false thì lấy 3 cái, ngược lại lấy hết
  const commentsToShow = showAllComments ? replies : replies.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold">Lỗi</h1>
          <p>{error}</p>
          <Link to="/community" className="text-blue-500 hover:underline mt-4 inline-block">
            &larr; Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Layout giống file cũ: max-w-2xl */}
      <main className="max-w-2xl mx-auto px-6 pt-20 pb-6">
        
        {/* Link Quay lại */}
        <div className="mb-4">
          <Link to="/community" className="text-gray-600 hover:text-black hover:underline flex items-center gap-1">
            <ArrowLeft size={18} /> Quay lại
          </Link>
        </div>

        {/* --- PHẦN BÀI VIẾT (POST CARD) --- */}
        {post && (
            // Style này mô phỏng lại PostCard
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold overflow-hidden">
                         <img src={Avatar} alt="user" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                                {post.author?.username || "Ẩn danh"}
                            </span>
                            {post.author?.is_verified_traveler && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatTimeAgo(post.created_at)}</span>
                            {post.category && (
                                <>
                                    <span>•</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                                        {CATEGORY_LABELS[post.category] || post.category}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {post.title}
                </h3>

                <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">
                    {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t">
                    <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{post.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle size={16} />
                        <span>{post.replies_count || 0}</span>
                    </div>
                </div>
            </div>
        )}

        {/* --- KHUNG BÌNH LUẬN (BOX TRẮNG RIÊNG BIỆT) --- */}
        <div className="bg-white rounded-lg shadow-md mt-4 p-5">
          <h3 className="text-lg font-semibold mb-4">
            Bình luận ({replies.length})
          </h3>
          
          {/* Danh sách bình luận */}
          <div className="flex flex-col gap-4">
            {replies.length > 0 ? (
              // Dùng commentsToShow để giới hạn số lượng hiển thị
              commentsToShow.map(reply => (
                <div key={reply.id} className="flex gap-3 group">
                  <img 
                    src={Avatar}
                    alt="avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  
                  {/* Bong bóng chat màu xám */}
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 relative">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-900">
                            {reply.author?.username || "Ẩn danh"}
                        </p>
                        {/* Nút xóa ẩn, hiện khi hover */}
                        <button 
                            onClick={() => handleDeleteReply(reply.id)}
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 size={14}/>
                        </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{reply.content}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                        {formatTimeAgo(reply.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
            )}
          </div>
          
          {/* Nút "Hiện thêm bình luận" */}
          {replies.length > 3 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-gray-500 hover:underline mt-4 text-sm font-medium cursor-pointer"
            >
              Hiện thêm bình luận
            </button>
          )}

          {/* Form nhập bình luận (Avatar + Input + Arrow Icon) */}
          {isVerified ? (
            <div className="mt-6 flex gap-3 items-center">
                <img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
                <input 
                    type="text" 
                    placeholder="Viết bình luận..." 
                    className="bg-gray-100 rounded-lg px-4 py-2 focus:outline-none flex-1 text-sm h-10"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()} // Enter để gửi
                />
                
                {/* Nút gửi dạng Icon */}
                <button 
                    onClick={handleSubmitReply}
                    disabled={isSubmittingReply || !replyContent}
                    className={`transition ${replyContent ? 'text-black hover:scale-110' : 'text-gray-300'}`}
                >
                     {isSubmittingReply ? <Loader2 className="animate-spin" size={24}/> : <ArrowBigRight size={28} />}
                </button>
            </div>
          ) : (
             <div className="mt-6 text-sm text-center text-yellow-600 bg-yellow-50 p-2 rounded">
                 Bạn cần đặt phòng (Verified) để bình luận.
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default PostDetailPage;