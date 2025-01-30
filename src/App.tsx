import { Routes, Route } from "react-router-dom";

import Posts from "@/components/posts";
import Post from "@/components/post";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Posts />} />
      <Route path="/posts/:id" element={<Post />} />
    </Routes>
  );
}

export default App;
