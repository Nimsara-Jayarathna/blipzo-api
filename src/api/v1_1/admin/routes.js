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
router.get("/users", requireAdminAuth, adminController.users);
router.get("/users/:id", requireAdminAuth, adminController.userById);
router.patch("/users/:id", requireAdminAuth, adminController.updateUser);
router.post("/users/:id/reset-password", requireAdminAuth, adminController.resetUserPassword);
router.post("/users/:id/force-logout", requireAdminAuth, adminController.forceLogoutUser);
router.get("/users/:id/activity", requireAdminAuth, adminController.userActivity);
router.get("/currencies", requireAdminAuth, adminController.currencies);
router.get("/currencies/:id", requireAdminAuth, adminController.currencyById);
router.post("/currencies", requireAdminAuth, adminController.createCurrency);
router.patch("/currencies/:id", requireAdminAuth, adminController.updateCurrency);
router.post("/currencies/:id/set-default", requireAdminAuth, adminController.setCurrencyDefault);
router.post("/currencies/:id/toggle-status", requireAdminAuth, adminController.toggleCurrencyStatus);
router.get("/categories", requireAdminAuth, adminController.categories);
router.post("/categories", requireAdminAuth, adminController.createCategory);
router.patch("/categories/:id", requireAdminAuth, adminController.updateCategory);
router.post("/categories/:id/set-default", requireAdminAuth, adminController.setCategoryDefault);
router.delete("/categories/:id", requireAdminAuth, adminController.deleteCategory);
router.patch("/categories/settings", requireAdminAuth, adminController.updateCategorySettings);

export default router;
