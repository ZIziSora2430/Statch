// ==================== PostDetailPage. jsx ====================
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, Clock, Eye, MessageCircle, ArrowBigRight, Loader2, Trash2 } from "lucide-react";
import DefaultAvatar from "../images/avatar-default.svg";

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

// ĐÃ ĐỔI: CATEGORY_LABELS -> LOCATION_LABELS
const LOCATION_LABELS = {
  // Quận 1-12
  district1: "Quận 1",
  district2: "Quận 2",
  district3: "Quận 3",
  district4: "Quận 4",
  district5: "Quận 5",
  district6: "Quận 6",
  district7: "Quận 7",
  district8: "Quận 8",
  district9: "Quận 9",
  district10: "Quận 10",
  district11: "Quận 11",
  district12: "Quận 12",

  // Các quận khác
  binh_thanh: "Quận Bình Thạnh",
  binh_tan: "Quận Bình Tân",
  phu_nhuan: "Quận Phú Nhuận",
  tan_binh: "Quận Tân Bình",
  tan_phu: "Quận Tân Phú",
  go_vap: "Quận Gò Vấp",

  // TP Thủ Đức
  thu_duc: "TP Thủ Đức",

  // Huyện
  hoc_mon: "Huyện Hóc Môn",
  binh_chanh: "Huyện Bình Chánh",
  nha_be: "Huyện Nhà Bè",
  can_gio: "Huyện Cần Giờ",
  cu_chi: "Huyện Củ Chi",
};

function PostDetailPage() {
  // --- 1.  LOGIC LẤY DATA ---
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
  const [showAllComments, setShowAllComments] = useState(false);

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
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/verified-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response. json();
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent. trim() })
      });

      if (response.ok) {
        const newReply = await response. json();
        setReplies(prev => [...prev, newReply]);
        setReplyContent("");
        setPost(prev => ({ ... prev, replies_count: (prev.replies_count || 0) + 1 }));
      } else {
        alert("Lỗi khi gửi bình luận.");
      }
    } catch (err) {
      console. error(err);
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
      console. error(err);
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

  // Logic cắt comment
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
      
      <main className="max-w-2xl mx-auto px-6 pt-20 pb-6">
        
        {/* Link Quay lại */}
        <div className="mb-4">
          <Link to="/community" className="text-gray-600 hover:text-black hover:underline flex items-center gap-1">
            <ArrowLeft size={18} /> Quay lại
          </Link>
        </div>
        {/* --- PHẦN BÀI VIẾT (POST CARD) --- */}
        {post && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img src={DefaultAvatar} alt="user" className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-300 p-0.5"/>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {post.author?.username || "Ẩn danh"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{formatTimeAgo(post.created_at)}</span>
                  {/* ĐÃ ĐỔI: post.category -> post.location */}
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {LOCATION_LABELS[post.location] || post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {post. title}
            </h3>

            <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">
              {post.content}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{post.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span>{post.replies_count || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* --- KHUNG BÌNH LUẬN --- */}
        <div className="bg-white rounded-lg shadow-md mt-4 p-5">
          <h3 className="text-lg font-semibold mb-4">
            Bình luận ({replies.length})
          </h3>
          
          {/* Danh sách bình luận */}
          <div className="flex flex-col gap-4">
            {replies.length > 0 ?  (
              commentsToShow.map(reply => (
                <div key={reply.id} className="flex gap-3 group">
                  <img 
                    src={DefaultAvatar}
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-300 p-0.5"
                  />
                  
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 relative">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-gray-900">
                        {reply.author?.username || "Ẩn danh"}
                      </p>
                      <button 
                        onClick={() => handleDeleteReply(reply. id)}
                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{reply.content}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {formatTimeAgo(reply. created_at)}
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

          {/* Form nhập bình luận */}
          {isVerified ? (
            <div className="mt-6 flex gap-3 items-center">
              <img src={DefaultAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-300 p-0.5"/>
              <input 
                type="text" 
                placeholder="Viết bình luận..." 
                className="bg-gray-100 rounded-lg px-4 py-2 focus:outline-none flex-1 text-sm h-10"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
              />
              
              <button 
                onClick={handleSubmitReply}
                disabled={isSubmittingReply || ! replyContent}
                className={`transition ${replyContent ?  'text-black hover:scale-110' : 'text-gray-300'}`}
              >
                {isSubmittingReply ?  <Loader2 className="animate-spin" size={24}/> : <ArrowBigRight size={28} />}
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