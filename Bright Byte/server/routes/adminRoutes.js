// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const CourseController = require("../controllers/CourseController");
const UserController = require("../controllers/UserController");
const {authMiddleware} = require("../middleware/auth");

const adminMiddleware = async (req, res, next) => {
  if (req.user.email !== "admin@example.com") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};
router.get("/courses", authMiddleware, adminMiddleware, CourseController.getAllCoursesforadmin);
router.put("/courses/:id", authMiddleware, adminMiddleware, CourseController.updateCourseforadmin);
router.delete("/courses/:id", authMiddleware, adminMiddleware, CourseController.deleteCourseAdmin);
router.get("/students", authMiddleware, adminMiddleware, CourseController.getAllStudents);
router.get("/instructors", authMiddleware, adminMiddleware, CourseController.getAllInstructors);
router.put("/users/block/:userId", authMiddleware, adminMiddleware, UserController.blockUser);
router.put("/users/unblock/:userId", authMiddleware, adminMiddleware, UserController.unblockUser);

module.exports = router;