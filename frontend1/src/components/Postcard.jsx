import { Heart, MessageCircle } from "lucide-react";

export default function PostCard({ post }) {

  return (

    <div className="p-4 bg-white rounded-2xl shadow-sm border">

      {/* Header */}

      <div className="flex justify-between">

        <div className="flex items-center gap-3">

          <img

            src={post.avatar}

            alt={post.username}

            className="w-10 h-10 rounded-full"

          />

          <div>

            <p className="font-bold">{post.username}</p>

            <p className="text-sm text-gray-500">{post.time}</p>

          </div>

        </div>

        <span className="bg-red-700 text-white text-s px-3 py-2.5 rounded-lg">

          {post.city}

        </span>

      </div>



      {/* Content */}

      <p className="mt-3 text-gray-800">{post.content}</p>



      {/* Actions */}

      <div className="flex items-center gap-6 mt-3 text-gray-600">

        <span className="flex items-center gap-1">

          <Heart size={18} /> {post.likes}

        </span>

        <span className="flex items-center gap-1">

          <MessageCircle size={18} /> {post.comments}

        </span>

      </div>

    </div>

  );

}