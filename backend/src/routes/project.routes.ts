import { Router } from "express";
import { body } from "express-validator";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
  getMyInvitations,
  respondToInvitation,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/project.middleware";

const router = Router();

router.use(authenticate);

router.get("/invitations", getMyInvitations);
router.post("/invitations/:invitationId/respond", respondToInvitation);

router.get("/", getProjects);
router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  validate,
  createProject
);

router.get("/:projectId", requireProjectMember, getProjectById);
router.patch("/:projectId", requireProjectAdmin, updateProject);
router.delete("/:projectId", authenticate, deleteProject);

router.post("/:projectId/members", requireProjectAdmin, inviteMember);
router.delete("/:projectId/members/:memberId", requireProjectMember, removeMember);
router.patch("/:projectId/members/:memberId/role", requireProjectAdmin, updateMemberRole);

export default router;