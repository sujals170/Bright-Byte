import { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage = { sender: "user", text: input, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.post("/student/chatbot", { message: input });
      const botMessage = { 
        sender: "bot", 
        text: response.data.reply, 
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      if (error.response?.data?.message === "Token is not valid") {
        navigate("/login");
      }
      const errorMessage = { 
        sender: "bot", 
        text: "Sorry, I couldn’t process that. Try again!", 
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSending) {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="group relative p-4 rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 animate-glow"
        >
          <MessageSquare className="h-7 w-7 animate-spin-slow group-hover:animate-spin" />
          <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-3 py-1 bg-gray-900/90 text-cyan-300 text-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            Bright Byte Chat
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-850/90 to-gray-800/95 rounded-3xl shadow-2xl border border-gray-600/50 w-[420px] h-[680px] flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gray-850/70 backdrop-blur-md border-b border-gray-600/50">
            <h3 className="text-xl font-bold text-cyan-100 flex items-center gap-2">
              <span className="text-2xl animate-pulse-slow">✨</span> Bright Byte AI
            </h3>
            <button
              onClick={toggleChatbot}
              className="text-gray-200 hover:text-cyan-300 transition-colors duration-200"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          {/* Chat Area */}
          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-5 bg-gray-900/80 backdrop-blur-sm">
            {messages.length === 0 ? (
              <div className="text-center text-gray-200 mt-14">
                <p className="text-base font-semibold animate-pulse-slow">Welcome to Bright Byte AI</p>
                <p className="text-sm mt-2 text-gray-300 opacity-80">Ask anything to brighten your day!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-3 animate-slideUp`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-teal-600 flex items-center justify-center text-white text-base font-bold shadow-lg">
                      BB
                    </div>
                  )}
                  <div
                    className={`group max-w-[80%] p-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-gray-600/90  to-gray-600/90 text-white border border-gray-500/50 backdrop-blur-sm"
                        : "bg-gradient-to-r from-gray-700/90 to-gray-600/90 text-gray-50 border border-gray-500/50 backdrop-blur-sm"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-200 mb-1">
                      {msg.sender === "user" ? "You" : "Bright Byte AI"}
                    </p>
                    <p className="text-base leading-relaxed break-words text-white">{msg.text}</p>
                    <p className="text-xs text-gray-300 mt-2 text-right opacity-80">{msg.timestamp}</p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-700 to-teal-400 flex items-center justify-center text-white text-base font-bold shadow-lg">
                      U
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-gray-850/70 border-t border-gray-600/50 flex items-center gap-4 backdrop-blur-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isSending ? "Sending..." : "Type your message..."}
              disabled={isSending}
              className={`flex-1 bg-gray-800/80 text-white rounded-full py-3 px-6 border border-gray-600/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all duration-300 shadow-md hover:shadow-lg ${
                isSending ? "opacity-60 cursor-not-allowed bg-gray-700/80 text-orange-200 placeholder-orange-200" : "hover:border-cyan-500/50"
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending}
              className={`p-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-700 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg ${
                isSending ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSending ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;