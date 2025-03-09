const express = require("express");
const router = express.Router();
const CourseController = require("../controllers/CourseController");
const { createMeeting } = require('../controllers/meetController');
const { instructorAuth, studentAuth ,chatAuth } = require("../middleware/auth");

router.get("/public", CourseController.getPublicCourses);
router.get("/enrolled", studentAuth, CourseController.getEnrolledCourses);
router.get("/", instructorAuth, CourseController.getAllCourses);
router.get("/:id", CourseController.getCourse);
router.post("/", instructorAuth, CourseController.createCourse);
router.put("/:id", instructorAuth, CourseController.updateCourse);
router.delete("/:id", instructorAuth, CourseController.deleteCourse);
router.post("/:id/sessions", instructorAuth, CourseController.upload, CourseController.addSession);
router.put('/:id/block-student/:studentId', instructorAuth, CourseController.blockStudent);
router.put('/:id/unblock-student/:studentId', instructorAuth, CourseController.unblockStudent);
router.get('/:courseId/quizzes/:quizId', studentAuth, CourseController.getQuizForStudent);
router.post('/:courseId/quizzes/:quizId/submit', studentAuth, CourseController.submitQuiz);
router.delete("/:id", instructorAuth, CourseController.deleteCourse);
// Move this route up to avoid overlap with less specific routes
router.put('/courses/:courseId/sessions/:sessionId/:studentId', studentAuth, CourseController.updateSessionCompletion);
router.get('/courses/:courseId/certificate/:studentId', studentAuth, CourseController.generateCertificate);
router.get('/courses/verify/:certificateId', CourseController.verifyCertificate); // New verification route
router.post('/courses/:courseId/live-sessions', createMeeting);
router.put('/:courseId/sessions/:sessionId/students/:studentId/complete', studentAuth, CourseController.updateSessionCompletion); // Remove or adjust if duplicate
router.get('/:courseId/attendance/:sessionId', instructorAuth, CourseController.getAttendance);
router.put('/:courseId/attendance/:sessionId', studentAuth, CourseController.markAttendance);
router.post('/markAttendance/:courseId/:sessionId', studentAuth, CourseController.markAttendance); // Consider removing if redundant
router.delete("/:id/sessions/:sessionId", instructorAuth, CourseController.deleteSession);
router.post("/:courseId/live-sessions", instructorAuth, CourseController.scheduleLiveSession);
router.put("/:courseId/live-sessions/:sessionId/start", instructorAuth, CourseController.startLiveSession);
router.put("/:courseId/live-sessions/:sessionId/end", instructorAuth, CourseController.endLiveSession);
router.delete("/:courseId/live-sessions/:sessionId", instructorAuth, CourseController.deleteLiveSession);
router.get("/live-session/:sessionId", CourseController.getCourseBySessionId); // No auth required for joining

// Chat-related endpoint
router.get("/:courseId/classmates", chatAuth, CourseController.getClassmates);

router.get("/:courseId/messages", chatAuth, CourseController.getMessages);


router.post("/:id/quizzes", instructorAuth, CourseController.addQuiz);
router.put("/:id/quizzes/:quizId/questions", instructorAuth, CourseController.addQuestionToQuiz);
router.delete("/:id/quizzes/:quizId", instructorAuth, CourseController.deleteQuiz);
router.post("/:id/assignments", instructorAuth, CourseController.addAssignment);
router.delete("/:id/assignments/:assignmentId", instructorAuth, CourseController.deleteAssignment);
router.post("/:id/enroll", studentAuth, CourseController.enrollStudent);
router.get("/:id/sessions/:sessionId", studentAuth, CourseController.getRecordedSession);



router.get("/courses/paid/:courseId", async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId).populate("instructor");
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.isFree) return res.status(400).json({ message: "This is not a paid course" });
  
      // Return course details without enrollment check
      res.json({
        _id: course._id,
        name: course.name,
        description: course.description,
        instructor: course.instructor,
        isFree: course.isFree,
        price: course.price,
        students: course.students, // Include for frontend enrollment check
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/courses/paid/:courseId/enroll", async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ message: "Payment ID required" });
  
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.isFree) return res.status(400).json({ message: "This is not a paid course" });
  
      const studentId = req.user.id; // Assuming auth middleware
      if (course.students.some((s) => s.studentId.toString() === studentId)) {
        return res.status(400).json({ message: "Already enrolled" });
      }
  
      // Simulate payment verification (replace with real payment gateway check)
      const paymentVerified = paymentId.startsWith("PAY-"); // Placeholder
      if (!paymentVerified) return res.status(400).json({ message: "Invalid payment" });
  
      course.students.push({ studentId });
      await course.save();
      res.json({ message: "Enrolled successfully after payment" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });



module.exports = router;