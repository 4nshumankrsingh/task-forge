import { Router } from "express";
import { body } from "express-validator";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { requireProjectMember } from "../middleware/project.middleware";

const router = Router();

router.use(authenticate);

// Tasks scoped under a project
router.get(
  "/project/:projectId",
  requireProjectMember,
  getTasksByProject
);

router.post(
  "/project/:projectId",
  requireProjectMember,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Task title is required.")
      .isLength({ max: 200 })
      .withMessage("Title can't exceed 200 characters."),
    body("description").optional().trim(),
    body("status")
      .optional()
      .isIn(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
      .withMessage("Invalid status."),
    body("priority")
      .optional()
      .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .withMessage("Invalid priority."),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO date."),
    body("assigneeId").optional().isString(),
  ],
  validate,
  createTask
);

// Individual task operations
router.get("/me", getMyTasks);
router.get("/:taskId", getTaskById);

router.patch(
  "/:taskId",
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
    body("status")
      .optional()
      .isIn(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
      .withMessage("Invalid status."),
    body("priority")
      .optional()
      .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .withMessage("Invalid priority."),
    body("dueDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("Due date must be a valid ISO date."),
  ],
  validate,
  updateTask
);

router.delete("/:taskId", deleteTask);

export default router;