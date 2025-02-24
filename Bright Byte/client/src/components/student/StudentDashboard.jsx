import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Calendar, MessageSquare, Book, BarChart, User, Settings, FileText, ClipboardList, Bell, LogOut } from "lucide-react";

const courses = [
  { id: 1, name: "JavaScript Fundamentals", progress: 75 },
  { id: 2, name: "React Basics", progress: 50 },
  { id: 3, name: "Node.js Essentials", progress: 40 },
];

const quizzes = [
  { id: 1, name: "JavaScript Basics", status: "Completed", score: "90%" },
  { id: 2, name: "React Components", status: "Pending", score: "-" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <div className={`w-72 bg-white p-6 shadow-lg h-screen flex flex-col justify-between sm:block fixed sm:static ${sidebarOpen ? "block" : "hidden"}`}>
        <div>
          <h1 className="text-xl font-bold mb-6">Student Dashboard</h1>

          <nav className="space-y-3">
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/dashboard')}>
              <BarChart className="mr-2 h-6 w-6" /> Dashboard

            </button>
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/courses')}>
              <Book className="mr-2 h-6 w-6" /> Courses

            </button>
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/assignments')}>
              <FileText className="mr-2 h-6 w-6" /> Assignments

            </button>
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/quizzes')}>
              <ClipboardList className="mr-2 h-6 w-6" /> Quizzes & Grades

            </button>
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/profile')}>
              <User className="mr-2 h-6 w-6" /> Profile

            </button>
            <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-6 w-6" /> Settings

            </button>
          </nav>
        </div>
        <button className="flex items-center w-full p-3 text-left hover:bg-gray-200 rounded">
          <LogOut className="mr-2 h-6 w-6" /> Logout
        </button>
      </div>

      {/* Mobile Toggle Button for Sidebar */}
      <button
        className="sm:hidden p-4 bg-blue-500 text-white rounded-full absolute top-6 left-6 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "✖" : "☰"}
      </button>

      {/* Main Content */}
      <div
        className={`flex-1 p-6 sm:p-10 max-w-5xl mx-auto ${
          sidebarOpen ? "hidden" : "block"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0 text-center sm:text-left">
            Welcome back, Student!
          </h1>
          <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300">
            <Bell className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar */}
        <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-medium flex items-center">
            <Calendar className="mr-2 h-6 w-6" /> Calendar
          </h2>
          <p className="text-gray-600 mt-3">Upcoming events and assignments.</p>
        </div>

        {/* Course Completion Progress */}
        <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-medium">Course Completion</h2>
          <div className="mt-3">
            {courses.map((course) => (
              <div key={course.id} className="mb-4">
                <p>
                  {course.name} - {course.progress}%
                </p>
                <div className="w-full bg-gray-200 h-3 rounded">
                  <div
                    className="bg-zinc-600 h-3 rounded"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes & Grades */}
        <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-medium">Quizzes & Grades</h2>
          <table className="w-full mt-3 border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Quiz</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Score</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-t">
                  <td className="p-3">{quiz.name}</td>
                  <td className="p-3">{quiz.status}</td>
                  <td className="p-3">{quiz.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Chatbot */}
        <div className="fixed bottom-6 right-6">
          {aiChatOpen ? (
            <div className="w-96 bg-white shadow-xl rounded-lg p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">AI Support</h3>
                <button
                  onClick={() => setAiChatOpen(false)}
                  className="text-gray-600"
                >
                  ✖
                </button>
              </div>
              <div className="mt-3 h-48 border p-3 overflow-y-auto">
                Chat content...
              </div>
              <input
                type="text"
                placeholder="Ask something..."
                className="mt-3 w-full p-3 border rounded"
              />
            </div>
          ) : (
            <button
              onClick={() => setAiChatOpen(true)}
              className="p-4 bg-blue-500 text-white rounded-full shadow-xl"
            >
              <MessageSquare className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
