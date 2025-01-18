import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Builder from "./pages/Builder.jsx";
import Editor from "./components/Editor.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  );
}

export default App;
