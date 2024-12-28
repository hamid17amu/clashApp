import { Router } from "express";
import prisma from "../config/database.js";
const router = Router();
router.get("/verify-email", async (req, res) => {
    const { email, token } = req.query;
    if (email && token) {
        const user = await prisma.user.findUnique({ where: {
                email: email
            } });
        if (user) {
            if (token === user.emailVarifyToken) {
                await prisma.user.update({
                    data: {
                        emailVarifiedAt: new Date(),
                        emailVarifyToken: null
                    },
                    where: {
                        email: email
                    }
                });
                return res.redirect(`${process.env.CLIENT_URL}/login`);
            }
        }
        return res.redirect("/api/auth/verify-error");
    }
    return res.redirect("api/auth/verify-error");
});
router.get("/verify-error", async (req, res) => {
    return res.render("auth/emailVerifyError");
});
export default router;
