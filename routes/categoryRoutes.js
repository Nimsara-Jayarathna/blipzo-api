import { Router } from "express";
import {
  listActiveCategories,
  listAllCategories,
  createCategory,
  setDefaultCategory,
  archiveCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/active", listActiveCategories);
router.get("/all", listAllCategories);
router.post("/", createCategory);
router.patch("/:id", setDefaultCategory);
router.delete("/:id", archiveCategory);

export default router;
