import { Link, useNavigate } from "react-router-dom";
import { Book, ArrowLeft, LogOut, Plus, Calendar, FileText, HelpCircle, Trash2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

function InstructorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        console.log("[InstructorDashboard] Courses fetched:", response.data);
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("[InstructorDashboard] Error fetching courses:", err);
        setError("Failed to load courses. Please try again.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        name: `New Course ${Date.now()}`,
        isFree: true,
        isPublic: true,
        students: [],
        sessions: [],
        quizzes: [],
        assignments: [],
        liveSessions: [{
          title: "Initial Session", // Required field
          date: new Date().toISOString().split("T")[0], // Required field (YYYY-MM-DD)
          time: "12:00 PM", // Required field
          sessionId: `SESSION-${Math.random().toString(36).substr(2, 9).toUpperCase()}` // Unique sessionId
        }],
      };
      const response = await api.post("/courses", courseData);
      const newCourse = response.data;
      setCourses((prev) => [...prev, newCourse]);
      console.log("[InstructorDashboard] New course created:", newCourse);
      setError(null);
    } catch (err) {
      console.error("[InstructorDashboard] Error creating course:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create course. Please try again.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
      console.log("[InstructorDashboard] Course deleted:", courseId);
      setError(null);
    } catch (err) {
      console.error("[InstructorDashboard] Error deleting course:", err);
      setError("Failed to delete course. Please try again.");
    }
  };

  const handleChatNavigation = (courseId) => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    console.log("[InstructorDashboard] Token before navigation:", token);
    if (!token) {
      console.log("[InstructorDashboard] No token found, redirecting to login");
      navigate("/login");
    } else {
      console.log("[InstructorDashboard] Navigating to chat for course:", courseId);
      navigate(`/chat/${courseId}`);
    }
  };

  const allLiveSessions = courses.flatMap((course) =>
    (course.liveSessions || []).map((session) => ({
      ...session,
      courseName: course.name,
    }))
  );

  return (
    <section className="min-h-screen text-gray-200 bg-gradient-to-br from-gray-950 to-gray-900">
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-cyan-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-200 hover:text-cyan-400 transition-all duration-300">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300">Home</Link>
            <Link to="/instructor/courses" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300">Courses</Link>
            <Link to="/instructor/students" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300">Students</Link>
            {courses.length > 0 && (
              <button
                onClick={() => handleChatNavigation(courses[0]._id)}
                className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300"
              >
                Chat
              </button>
            )}
          </div>
          <button
            onClick={() => navigate("/login")}
            className="text-gray-200 font-medium hover:text-cyan-400 flex items-center gap-2 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-100 mb-8">Instructor Dashboard</h1>

        {loading && <p className="text-gray-400">Loading courses...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-b from-gray-900 to-gray-850 rounded-lg shadow-md border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Book className="h-6 w-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-gray-100">Manage Courses</h2>
                </div>
                <button
                  onClick={handleCreateCourse}
                  className="p-1 rounded-full hover:bg-cyan-600/20 transition-all duration-200"
                  title="Create New Course"
                >
                  <Plus className="h-5 w-5 text-cyan-400" />
                </button>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex justify-between items-center p-3 hover:bg-gray-800 rounded-md transition-all duration-200"
                  >
                    <Link
                      to={`/instructor/manage-course/${course._id}`}
                      className="flex-1"
                    >
                      <span>
                        {course.name}{" "}
                        {course.isFree && <span className="text-xs text-green-400">(Free)</span>}
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{course.students.length} students</span>
                      <button
                        onClick={() => handleChatNavigation(course._id)}
                        className="p-1 rounded-full hover:bg-cyan-600/20 transition-all duration-200"
                        title="Chat with Students"
                      >
                        <MessageSquare className="h-5 w-5 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-1 rounded-full hover:bg-red-600/20 transition-all duration-200"
                        title="Delete Course"
                      >
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-900 to-gray-850 rounded-lg shadow-md border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-gray-100">Scheduled Sessions</h2>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {allLiveSessions.length > 0 ? (
                  allLiveSessions.map((session) => (
                    <div key={session.sessionId || session._id} className="p-3 bg-gray-800 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm truncate">{session.title}</span>
                        <span className="text-xs text-gray-400">{session.courseName}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {session.date} {session.time} -{" "}
                        {session.isLive ? "Live Now" : "Scheduled"} -{" "}
                        <Link
                          to={`/instructor/live-session/${session.sessionId}`}
                          className="text-cyan-400 hover:underline"
                        >
                          Join
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No sessions scheduled yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 bg-gradient-to-b from-gray-900 to-gray-850 rounded-lg shadow-md border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleCreateCourse}
                className="bg-cyan-600/20 p-4 rounded-md hover:bg-cyan-600/30 transition-all duration-300 text-cyan-400 text-center"
              >
                Create New Course
              </button>
              <button
                onClick={() => navigate("/instructor/create-quiz")}
                className="bg-cyan-600/20 p-4 rounded-md hover:bg-cyan-600/30 transition-all duration-300 text-cyan-400 text-center"
              >
                <HelpCircle className="h-5 w-5 mx-auto mb-2" />
                Create Quiz
              </button>
              <button
                onClick={() => navigate("/instructor/create-assignment")}
                className="bg-cyan-600/20 p-4 rounded-md hover:bg-cyan-600/30 transition-all duration-300 text-cyan-400 text-center"
              >
                <FileText className="h-5 w-5 mx-auto mb-2" />
                Create Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default InstructorDashboard;