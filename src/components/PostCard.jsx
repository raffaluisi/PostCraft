import React, { useRef } from "react";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";

export default function PostCard({ post, onChange, onApprove, index, theme }) {
  const ref = useRef();

  const downloadPostImage = async () => {
    if (!ref.current) return;
    const dataUrl = await htmlToImage.toPng(ref.current);
    download(dataUrl, `${post.headline.slice(0, 20)}.png`);
  };

  return (
    <div className="bg-white w-[360px] h-[480px] shadow-xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col justify-between">
      <div
        ref={ref}
        className="h-[360px] flex items-center justify-center relative"
        style={{
          backgroundImage: `url(/bg/${theme}.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <textarea
          value={post.headline}
          onChange={(e) => onChange("headline", e.target.value)}
          className="absolute w-[90%] bg-transparent text-white font-semibold text-2xl text-center resize-none outline-none"
          style={{
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
          }}
        />
      </div>
      <div className="p-4">
        <textarea
          value={post.caption}
          onChange={(e) => onChange("caption", e.target.value)}
          className="w-full text-sm text-gray-800 resize-none outline-none mb-2"
          rows={3}
        />
        <div className="text-xs text-gray-400 mb-2">
          {post.hashtags?.map((h) => `#${h}`).join(" ")}
        </div>
        <div className="flex justify-between">
          <button
            onClick={onApprove}
            className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
          >
            ✅ Aprovar
          </button>
          <button
            onClick={downloadPostImage}
            className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
          >
            ⬇️ Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
