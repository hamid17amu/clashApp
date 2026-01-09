import { Router } from "express";
import authRoutes from "./authRoutes.js";
import VerifyRoutes from './verifyRoutes.js';
import passwordRoutes from "./passwordRoutes.js";
import clashRoutes from "./clashRoutes.js";
import authMiddleware from "../middleware/authmMiddleware.js";


const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/auth", VerifyRoutes);
router.use("/api/auth", passwordRoutes);
router.use("/api/clash",clashRoutes);

export default router;