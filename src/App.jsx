import React, { useState } from "react";
import PostCard from "./components/PostCard";

const themes = ["folhas", "agua", "mente"];

export default function App() {
  const [posts, setPosts] = useState([]);

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
    alert(`Post ${index + 1} aprovado!`);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">📲 Curadoria de Posts</h1>

      <div className="flex justify-center">
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          📁 Importar JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {posts.length > 0 ? (
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
      ) : (
        <p className="text-center text-gray-400">Nenhum post carregado ainda.</p>
      )}
    </div>
  );
}
