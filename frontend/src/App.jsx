import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Builder from "./pages/Builder.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
    </Routes>
  );
}

export default App;
