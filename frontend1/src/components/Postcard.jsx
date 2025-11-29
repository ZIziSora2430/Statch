// ==================== PostCard.jsx ====================
import React from "react";
import { MessageCircle, Heart, Clock } from "lucide-react";

const formatTimeAgo = (dateString) => {
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

function PostCard({ post }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
          {post.author?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">
              {post.author?.username || "Ẩn danh"}
            </span>
            {post.author?.is_verified_traveler && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
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

      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>

      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
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
  );
}

export default PostCard;