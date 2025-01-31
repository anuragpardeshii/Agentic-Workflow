import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home.jsx";
import Builder from "./pages/Builder.jsx";
import Landing from "./components/Landing.jsx";
import Home from "./components/Home.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import AIHome from "./pages/AIHome.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/editor" element={<CodeEditor />} />
      {/* <Route path="/landing" element={<Landing />} /> */}
      <Route path="/ai" element={<AIHome />} />
    </Routes>
  );
}

export default App;
