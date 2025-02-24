import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Forgot from "./components/auth/Forgot";
import Otppage from "./components/auth/Otppage";
import ProtectedRoute from "./components/protectedRoute";
import StudentDashboard from "./components/StudentDashboard";
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute/>}>
          
        </Route>
        <Route path="/otppage" element={<Otppage />} /> 
        <Route path="/student-dashboard" element={<StudentDashboard/>} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
