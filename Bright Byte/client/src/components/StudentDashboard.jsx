import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Ensure Axios sends cookies with requests
axios.defaults.withCredentials = true;

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Store user info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/student-dashboard");
        if (response.data.status === true) {
          setUser(response.data.user); // Assuming backend sends user info
        } else {
          toast.error(response.data.message || "Failed to load dashboard");
          navigate("/login");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
        if (errorMessage === "Token has expired" || errorMessage === "No token, authorization denied") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/logout");
      if (response.data.status === true) {
        toast.success("Logged out successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/95 rounded-lg shadow border border-gray-800 p-6 space-y-4 text-gray-200">
        <h1 className="text-2xl font-bold text-center">Student Dashboard</h1>
        <p>Welcome, {user.email || "Student"}!</p>
        <p>User Type: {user.userType}</p>
        <p>ID: {user.id}</p>
        <button
          onClick={handleLogout}
          className="w-full text-gray-100 bg-cyan-800 hover:bg-cyan-900 rounded-lg py-2 mt-4 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;