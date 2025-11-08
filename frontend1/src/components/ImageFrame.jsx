// components/ImageFrame.jsx
export default function ImageFrame({
  src,
  alt = "",
  // Kích thước & tỉ lệ
  width,              // vd: 320 (px) hoặc "100%"
  height,             // nếu không set, dùng aspectRatio
  ratio,              // vd: "16/9", "1/1", "4/5" (CSS aspect-ratio)
  // Trình bày
  rounded = "xl",     // "none" | "md" | "xl" | "full"
  border = true,
  shadow = "lg",      // "none" | "sm" | "md" | "lg"
  objectFit = "cover",// "cover" | "contain"
  bg = "white",       // nền sau ảnh (hữu ích cho contain)
  padding = 0,        // padding bên trong khung (px)
  // Phụ trợ
  caption,            // chú thích dưới
  href,               // nếu muốn click
  badge,              // text góc trên trái
  className = "",
  children,           // overlay tùy ý (icon, nút…)
}) {
  const roundedMap = {
    none: "rounded-none",
    md: "rounded-md",
    xl: "rounded-xl",
    full: "rounded-full",
  };
  const shadowMap = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const WrapperTag = href ? "a" : "div";
  const styleBox = {
    width: typeof width === "number" ? `${width}px` : width, // có thể là "100%"
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
    aspectRatio: !height && ratio ? ratio.replace(":", " / ").replace("/", " / ") : undefined,
    backgroundColor: bg,
    padding,
  };

  return (
    <div className={`inline-block ${className}`}>
      <WrapperTag
        href={href}
        className={[
          "relative block overflow-hidden",
          roundedMap[rounded] ?? "rounded-xl",
          shadowMap[shadow] ?? "shadow-lg",
          border ? "border border-gray-200" : "border-0",
          "transition-transform hover:scale-[1.01]",
        ].join(" ")}
        style={styleBox}
      >
        {/* Ảnh */}
        <img
          src={src}
          alt={alt}
          style={{ objectFit }}
          className="h-full w-full"
          loading="lazy"
        />

        {/* Badge góc */}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            {badge}
          </span>
        )}

        {/* Overlay tuỳ ý */}
        {children && (
          <div className="pointer-events-none absolute inset-0">{children}</div>
        )}
      </WrapperTag>

      {caption && (
        <div className="mt-2 text-sm text-gray-700">{caption}</div>
      )}
    </div>
  );
}
