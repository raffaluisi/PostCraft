import React, { useState } from "react";
import PostCard from "./components/PostCard";
import postsData from "./data/posts_mindfulness.json";

const themes = ["folhas", "agua", "mente"];

export default function App() {
  const [posts, setPosts] = useState(postsData);

  const handleChange = (index, field, value) => {
    const updated = [...posts];
    updated[index][field] = value;
    setPosts(updated);
  };

  const handleApprove = (index) => {
    alert(`Post ${index + 1} aprovado!`);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">📲 Curadoria de Posts</h1>
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
