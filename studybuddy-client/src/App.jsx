import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClassesPage from "./pages/ClassesPage";
import TutorDashboard from "./pages/TutorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/tutor" element={<TutorDashboard />} />
      </Routes>
    </Router>
  );
}


export default App;
