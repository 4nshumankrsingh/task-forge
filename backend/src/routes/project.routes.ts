import { Router } from "express";
import { body } from "express-validator";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/project.middleware";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get("/", getProjects);

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required.")
      .isLength({ max: 100 })
      .withMessage("Name can't exceed 100 characters."),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description can't exceed 500 characters."),
  ],
  validate,
  createProject
);

router.get("/:projectId", requireProjectMember, getProjectById);

router.patch(
  "/:projectId",
  requireProjectAdmin,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
    body("status")
      .optional()
      .isIn(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"])
      .withMessage("Invalid status value."),
  ],
  validate,
  updateProject
);

router.delete("/:projectId", deleteProject);

// Member management
router.post(
  "/:projectId/members",
  requireProjectAdmin,
  [
    body("email").isEmail().withMessage("Valid email required."),
    body("role")
      .optional()
      .isIn(["ADMIN", "MEMBER"])
      .withMessage("Role must be ADMIN or MEMBER."),
  ],
  validate,
  addMember
);

router.delete("/:projectId/members/:memberId", requireProjectMember, removeMember);

router.patch(
  "/:projectId/members/:memberId/role",
  requireProjectAdmin,
  [body("role").isIn(["ADMIN", "MEMBER"]).withMessage("Role must be ADMIN or MEMBER.")],
  validate,
  updateMemberRole
);

export default router;