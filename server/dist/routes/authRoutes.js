import { Router } from "express";
import { loginSchema, registerSchema } from "../Validation/authValidation.js";
import { ZodError } from "zod";
import { formatError, renderEmailEjs } from "../helper.js";
import prisma from "../config/database.js";
import bcrypt from 'bcrypt';
import { emailQueue, emailQueueName } from "../jobs/emailJobs.js";
import uuid4 from "uuid4";
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/authmMiddleware.js";
const router = Router();
router.post("/register", async (req, res) => {
    try {
        const body = req.body;
        const payload = registerSchema.parse(body);
        let user = await prisma.user.findUnique({ where: {
                email: payload.email
            } });
        if (user) {
            return res.status(422).json({
                errors: {
                    email: "Email already exists"
                }
            });
        }
        const salt = await bcrypt.genSalt(12);
        payload.password = await bcrypt.hash(payload.password, salt);
        const token = await bcrypt.hash(uuid4(), salt);
        const url = `${process.env.APP_URL}/api/auth/verify-email?email=${payload.email}&token=${token}`;
        const html = await renderEmailEjs("emailVerify", { name: payload.name, url: url });
        await emailQueue.add(emailQueueName, { to: payload.email, subject: "Clash Email Verification ", html: html });
        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                emailVarifyToken: token
            }
        });
        return res.json({ message: "Please check your email. We have sent you a verification link." });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid Data", errors });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        let user = await prisma.user.findUnique({ where: {
                email: payload.email
            } });
        if (!user || user == null || user === undefined) {
            res.status(422).json({ errors: {
                    email: "Email not found."
                } });
        }
        const compare = await bcrypt.compare(payload.password, user.password);
        if (!compare) {
            res.status(422).json({ errors: {
                    email: "Invalid credentials"
                } });
        }
        if (user?.emailVarifiedAt === null) {
            res.status(422).json({ message: "Email not verified. Please check your email for the verification link." });
        }
        const JWTPayload = {
            id: user?.id,
            name: user?.name,
            email: user?.email
        };
        const token = jwt.sign(JWTPayload, process.env.SECRET_KEY, { expiresIn: "365d" });
        return res.json({
            message: "Logged in successfully",
            data: {
                ...JWTPayload,
                token: `Bearer ${token}`
            }
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid Data", errors });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/user", authMiddleware, async (req, res) => {
    const user = req.user;
    return res.json({ data: user });
});
export default router;
