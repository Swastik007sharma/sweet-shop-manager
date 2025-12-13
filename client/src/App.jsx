import { Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Redirect root to login for now since Dashboard isn't ready */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;