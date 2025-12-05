// ==================== PostCard.jsx ====================
import React from "react";
import { MessageCircle, Eye, Clock } from "lucide-react";
import DefaultAvatar from "../images/avatar-default.svg";


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

// ĐÃ SỬA: Key khớp với Backend (snake_case, lowercase)
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


function PostCard({ post }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <img src={DefaultAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-300 p-0.5"/>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">
              {post. author?.username || "Ẩn danh"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatTimeAgo(post.created_at)}</span>
            {/* ĐÃ SỬA: Đổi từ post.category sang post.location */}
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

      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>

      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
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
  );
}

export default PostCard;