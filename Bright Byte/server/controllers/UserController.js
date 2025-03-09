// controllers/UserController.js
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");

class UserController {
  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      const Model = type === "student" ? Student : Instructor;
      await Model.findByIdAndUpdate(userId, { isBlocked: true });
      res.json({ message: `${type} blocked successfully` });
    } catch (error) {
      res.status(500).json({ message: "Error blocking user", error: error.message });
    }
  }

  static async unblockUser(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      const Model = type === "student" ? Student : Instructor;
      await Model.findByIdAndUpdate(userId, { isBlocked: false });
      res.json({ message: `${type} unblocked successfully` });
    } catch (error) {
      res.status(500).json({ message: "Error unblocking user", error: error.message });
    }
  }

  async handleBlockUser(userId, type, isBlocked) {
  try {
    if (isBlocked) {
      await AdminModel.unblockUser(userId, type);
      this.toast.success(`${type} unblocked successfully!`);
    } else {
      await AdminModel.blockUser(userId, type);
      this.toast.success(`${type} blocked successfully!`);
    }
    if (type === "student") {
      const updatedStudents = await AdminModel.fetchAllStudents();
      console.log("Updated students:", updatedStudents);
      this.setStudents(updatedStudents);
    } else if (type === "instructor") {
      const updatedInstructors = await AdminModel.fetchAllInstructors();
      console.log("Updated instructors:", updatedInstructors);
      this.setInstructors(updatedInstructors);
    }
  } catch (error) {
    console.error(`Error ${isBlocked ? "unblocking" : "blocking"} ${type}:`, error);
    this.toast.error(`Failed to ${isBlocked ? "unblock" : "block"} ${type}!`);
  }
}
}

module.exports = UserController;