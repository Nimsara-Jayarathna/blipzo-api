import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { attachAdminRequestMeta } from "./utils/adminResponse.js";
import { authLimiter } from "../../../middleware/rateLimiter.js";
import { requireAdminAuth } from "./middleware/adminAuth.middleware.js";

const router = Router();

router.use(attachAdminRequestMeta);

router.post("/auth/login", authLimiter, adminController.login);
router.get("/auth/session", adminController.session);
router.post("/auth/logout", adminController.logout);
router.get("/dashboard", requireAdminAuth, adminController.dashboard);

export default router;
