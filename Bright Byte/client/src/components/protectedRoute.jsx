import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Corrected to named import

const ProtectedRoute = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    console.log("ProtectedRoute - Cookie 'token':", token);
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      try {
        const decoded = jwtDecode(token);
        console.log("ProtectedRoute - Decoded token:", decoded);
        setUserRole(decoded.userType || "student");
      } catch (error) {
        console.error("ProtectedRoute - Error decoding token:", error);
        setUserRole("student");
      }
    } else {
      setUserRole("student");
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isLoggedIn) {
    console.log("ProtectedRoute - Not logged in, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  const currentPath = window.location.pathname;
  if (userRole === "instructor" && currentPath === "/student-dashboard") {
    console.log("ProtectedRoute - Instructor accessing student dashboard, redirecting to /instructor-dashboard");
    return <Navigate to="/instructor-dashboard" replace />;
  }
  if (userRole === "student" && currentPath === "/instructor-dashboard") {
    console.log("ProtectedRoute - Student accessing instructor dashboard, redirecting to /student-dashboard");
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;