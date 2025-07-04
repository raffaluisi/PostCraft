import React, { useState } from "react";
import PostCard from "./components/PostCard";
import postsData from "./data/posts_mindfulness.json";

const themes = ["folhas", "agua", "mente"];

export default function App() {
  const [posts, setPosts] = useState(postsData);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const json = JSON.parse(event.target.result);
      setPosts(json);
    };
    reader.readAsText(file);
  };

  const handleChange = (index, field, value) => {
    const updated = [...posts];
    updated[index][field] = value;
    setPosts(updated);
  };

  const handleApprove = (index) => {
    const updated = [...posts];
    updated[index].approved = true;
    setPosts(updated);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">📲 PostCraft</h1>
      <div className="flex justify-center">
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          📁 Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {posts.map((post, i) => (
          <PostCard
            key={i}
            post={post}
            index={i}
            theme={themes[i % themes.length]}
            onChange={(field, value) => handleChange(i, field, value)}
            onApprove={() => handleApprove(i)}
          />
        ))}
      </div>
    </div>
  );
}
