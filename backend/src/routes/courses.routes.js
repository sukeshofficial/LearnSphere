import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import * as coursesController from "../controllers/courses.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "INSTRUCTOR"),
  coursesController.createCourse,
);

export default router;
