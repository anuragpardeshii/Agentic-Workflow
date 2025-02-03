import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home.jsx";
import Builder from "./pages/Builder.jsx";
// import Landing from "./components/Landing.jsx";
import Home from "./components/Home.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import AIHome from "./pages/AIHome.jsx";
import Deploy from "./components/Deploy.jsx";
import { AuthProvider } from "./components/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx"; 

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/ai" element={<AIHome />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/editor" element={<CodeEditor />} />
          <Route path="/deploy" element={<Deploy />} />
        </Route>

        <Route path="/" element={<Home />} />
        {/* <Route path="/landing" element={<Landing />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
