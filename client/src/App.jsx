import { Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Redirect root to login for now since Dashboard isn't ready */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;