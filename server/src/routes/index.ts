import { Router } from "express";
import authRoutes from "./authRoutes.js";
import VerifyRoutes from './verifyRoutes.js';


const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/auth", VerifyRoutes);

export default router;