import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Menu, X, Calendar, User, MessageSquare, Home } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Chatbot from "./Chatbot";
import toast, { Toaster } from 'react-hot-toast';

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

function StudentDashboard() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  useEffect(() => {
    const fetchEnrolledCoursesAndSessions = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const decoded = jwtDecode(token);
          if (decoded.isBlocked) {
            toast.error(
              "Your account is blocked. Contact support.",
              {
                duration: 6000,
               
              },
            );
            Cookies.remove("token")
            navigate("/login");   
            return;
          }
          if (decoded.userType !== "student") {
            navigate("/instructor-dashboard");
            return;
          }
        setStudentName(decoded.firstName || "Student");

        const coursesResponse = await api.get("/courses/enrolled");
        const studentId = decoded.id;

        const courses = coursesResponse.data.map(course => {
          // Find the student's enrollment data
          const studentData = course.students.find(s => s.studentId.toString() === studentId);
          const attendanceRecords = studentData?.attendance || [];
          const completedSessions = studentData?.completedSessions || [];

          // Current recorded sessions only (exclude live sessions for progress)
          const currentSessionIds = (course.sessions || []).map(s => s._id.toString());
          const totalSessions = currentSessionIds.length;

          // Filter attendance and completed sessions to current recorded sessions
          const validAttendanceRecords = attendanceRecords.filter(record => 
            currentSessionIds.includes(record.sessionId.toString())
          );
          const attendedSessions = validAttendanceRecords.filter(record => record.present).length;
          const validCompletedSessions = completedSessions.filter(id => 
            currentSessionIds.includes(id.toString())
          ).length;

          // Use completed sessions for progress, capped at totalSessions
          const effectiveCompletedSessions = Math.min(validCompletedSessions, totalSessions);
          
          // Calculate progress percentage based on completed sessions
          const progressPercentage = totalSessions > 0 
            ? Math.round((effectiveCompletedSessions / totalSessions) * 100) 
            : 0;

          // // Debugging logs
          // console.log(`Course: ${course.name}`);
          // console.log("Total Recorded Sessions:", totalSessions);
          // console.log("Current Recorded Session IDs:", currentSessionIds);
          // console.log("Attendance Records:", attendanceRecords);
          // console.log("Valid Attendance Records:", validAttendanceRecords);
          // console.log("Attended Sessions:", attendedSessions);
          // console.log("Completed Sessions:", completedSessions);
          // console.log("Valid Completed Sessions:", validCompletedSessions);
          // console.log("Effective Completed Sessions:", effectiveCompletedSessions);
          // console.log("Progress Percentage:", progressPercentage);
          // console.log("Live Sessions:", course.liveSessions);

          return {
            id: course._id,
            title: course.name,
            progress: progressPercentage,
            duration: course.duration || "Unknown",
            instructor: course.instructor
              ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || "Unknown"
              : "Unknown",
          };
        });
        setEnrolledCourses(courses);

        const allLiveSessions = coursesResponse.data.flatMap(course =>
          (course.liveSessions || []).map(session => ({
            id: session._id,
            name: session.title,
            date: session.date,
            time: session.time,
            link: session.link,
            isLive: session.isLive,
            courseId: course._id,
            courseTitle: course.name,
          }))
        );
        setLiveSessions(allLiveSessions);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCoursesAndSessions();
  }, [navigate,refreshTrigger]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleJoinLiveSession = (sessionId, courseId) => {
    navigate(`/student/live-session/${courseId}/${sessionId}`);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEnrollmentSuccess = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener("enrollmentSuccess", handleEnrollmentSuccess);
    return () => window.removeEventListener("enrollmentSuccess", handleEnrollmentSuccess);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen text-gray-200 bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen text-gray-100 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div> <Toaster position="top-center"  reverseOrder={false}/> </div>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 to-gray-850 shadow-lg border-b border-cyan-500/30 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="h-9 w-9 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300" />
            <span className="text-2xl font-bold text-gray-100 group-hover:text-cyan-300 transition-all duration-300">Bright Byte</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300 flex items-center gap-2">
              <Home className="h-5 w-5" /> Home
            </Link>
            <Link to="/courses" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Courses
            </Link>
            <Link to="/student/profile" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300 flex items-center gap-2">
              <User className="h-5 w-5" /> Profile
            </Link>
            <Link to="/chat" className="text-gray-200 font-medium hover:text-cyan-400 transition-all duration-300 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Chat
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-200 font-medium hover:text-cyan-400 flex items-center gap-2 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
          <button onClick={toggleMenu} className="md:hidden text-gray-200 hover:text-cyan-400 focus:outline-none">
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 px-4 py-4 space-y-3 border-t border-gray-700/50 backdrop-blur-sm">
            <Link to="/" className="block py-2 px-4 text-gray-200 hover:bg-gray-800 hover:text-cyan-400 rounded-md transition-all duration-300 flex items-center gap-2" onClick={toggleMenu}>
              <Home className="h-5 w-5" /> Home
            </Link>
            <Link to="/courses" className="block py-2 px-4 text-gray-200 hover:bg-gray-800 hover:text-cyan-400 rounded-md transition-all duration-300 flex items-center gap-2" onClick={toggleMenu}>
              <BookOpen className="h-5 w-5" /> Courses
            </Link>
            <Link to="/student/profile" className="block py-2 px-4 text-gray-200 hover:bg-gray-800 hover:text-cyan-400 rounded-md transition-all duration-300 flex items-center gap-2" onClick={toggleMenu}>
              <User className="h-5 w-5" /> Profile
            </Link>
            <Link to="/student-chat" className="block py-2 px-4 text-gray-200 hover:bg-gray-800 hover:text-cyan-400 rounded-md transition-all duration-300 flex items-center gap-2" onClick={toggleMenu}>
              <MessageSquare className="h-5 w-5" /> Chat
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 text-gray-200 hover:bg-gray-800 hover:text-cyan-400 rounded-md flex items-center gap-2 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <div className="lg:w-1/4 flex flex-col gap-8">
          <div className="bg-gradient-to-b from-gray-900/90 to-gray-850/90 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-gray-100 mb-3 group-hover:text-cyan-300">Hello, {studentName}</h2>
            <p className="text-sm text-gray-300 group-hover:text-cyan-400">Your learning journey awaits!</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900/90 to-gray-850/90 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 group">
            <h3 className="text-xl font-bold text-gray-100 mb-4 group-hover:text-cyan-400">Navigation</h3>
            <div className="space-y-4">
              <Link to="/courses" className="flex items-center gap-3 text-gray-200 hover:text-cyan-400 transition-all duration-300">
                <BookOpen className="h-5 w-5" />
                <span>Browse Courses</span>
              </Link>
              <Link to="/student/profile" className="flex items-center gap-3 text-gray-200 hover:text-cyan-400 transition-all duration-300">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4 flex flex-col gap-12 relative">
          <div>
            <h2 className="text-4xl font-bold text-gray-100 mb-6 tracking-tight">Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-gradient-to-b from-gray-900/90 to-gray-850/90 rounded-xl shadow-lg border border-gray-700/50 hover:border-cyan-400/50 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 flex flex-col transition-all duration-300 group min-h-[360px]"
                  >
                    <div className="flex justify-center pt-6 pb-4">
                      <div className="bg-cyan-800/20 rounded-full p-4 shadow-inner">
                        <BookOpen className="h-12 w-12 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                      </div>
                    </div>
                    <div className="px-6 pb-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-cyan-300">{course.title}</h3>
                      <p className="text-sm text-gray-300 mb-4 group-hover:text-cyan-400">{course.duration} | by {course.instructor}</p>
                      <div className="flex flex-col items-start mb-4">
                        <div className="w-full bg-gray-800/50 rounded-full h-2.5 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-300 mt-2 group-hover:text-cyan-400">{course.progress}% Progress</span>
                      </div>
                      <Link
                        to={`/course/${course.id}`}
                        className="block w-full text-center bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-semibold py-2 px-4 rounded-full hover:from-cyan-700 hover:to-teal-600 hover:scale-105 hover:shadow-[0_0_12px_rgba(34,211,238,0.7)] mt-auto transition-all duration-300 shadow-md"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-300 text-lg">No enrolled courses yet. Explore <Link to="/courses" className="text-cyan-400 hover:underline">Courses</Link> to enroll!</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-100 mb-6 tracking-tight">Upcoming Live Sessions</h2>
            <div className="bg-gradient-to-b from-gray-900/90 to-gray-850/90 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 group">
              <div className="space-y-4">
                {liveSessions.length > 0 ? (
                  liveSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg hover:bg-gray-700/40 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                        <div>
                          <p className="text-sm font-medium text-gray-100 group-hover:text-cyan-300">{session.name}</p>
                          <p className="text-xs text-gray-300 group-hover:text-cyan-400">
                            {session.date} at {session.time} | {session.courseTitle} | {session.isLive ? "Live Now" : "Scheduled"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinLiveSession(session.id, session.courseId)}
                        className="text-gray-100 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!session.isLive}
                      >
                        Join
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-300 group-hover:text-cyan-400">No upcoming live sessions scheduled.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </section>
  );
}

export default StudentDashboard;  