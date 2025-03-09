const { GoogleGenerativeAI } = require("@google/generative-ai");
const Student = require('../models/Student');
class StudentController {
  static async handleChatbot(req, res) {
    try {
      const { message } = req.body;

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(message);
      const reply = result.response.text().trim();

      res.json({ reply });
    } catch (error) {
      console.error("Error with Gemini API:", error.message);
      res.status(500).json({ reply: "Sorry, I couldn’t process that right now. Try again later!" });
    }
  }

  static async getProfile(req, res) {
    try {
      const student = await Student.findById(req.user.id);
      if (!student) {
        return res.status(404).json({ status: false, message: "Student not found" });
      }
      res.json({
        username: student.username,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        dob: student.dob,
      });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ status: false, message: "Error fetching profile", error: error.message });
    }
  }
}

module.exports = StudentController;