import { Router, Request, Response } from "express";
import prisma from "../config/database.js";

const router = Router();

router.get("/verify-email", async(req: Request, res:Response)=>{
    const {email, token}= req.query;

    if(email && token){
       const user = await prisma.user.findUnique({where:{
        email: email as string
       }})

       if(user){
            if(token===user.emailVarifyToken){
                await prisma.user.update({
                    data:{
                        emailVarifiedAt: new Date(),
                        emailVarifyToken: null
                    },
                    where: {
                        email: email as string
                    }
                });
                return res.redirect(`${process.env.CLIENT_URL}/login`);
            }
       }
       return res.redirect("/api/auth/verify-error");
    }
    

    return res.redirect("api/auth/verify-error");
})

router.get("/verify-error", async(req: Request, res:Response)=>{
    return res.render("auth/emailVerifyError")
})

export default router;