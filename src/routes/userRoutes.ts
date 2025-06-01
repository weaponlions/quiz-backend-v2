import { createUser, getUser, updateUser, toggleUserActive } from "../controllers/userController";
import { Router } from "express";

const router: Router = Router();

router.post("", createUser);
router.get("", getUser);
router.put("/:id", updateUser);
router.patch("/:id/toggle-active", toggleUserActive);

export default router;