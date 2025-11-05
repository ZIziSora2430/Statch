import { useState } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function CloudinaryUpload() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    // data.secure_url là URL ảnh; data.public_id dùng để transform/xoá sau này
    setUrl(data.secure_url);
    console.log("Uploaded:", data);
  };

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} className="px-4 py-2 bg-red-600 text-white rounded">
        Upload
      </button>

      {url && (
        <div>
          <p className="text-sm">URL ảnh:</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {url}
          </a>
          <img src={url} alt="uploaded" className="mt-2 max-w-sm rounded shadow" />
        </div>
      )}
    </div>
  );
}