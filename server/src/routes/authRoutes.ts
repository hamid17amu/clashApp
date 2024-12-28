import { Request, Response, Router } from "express";
import { registerSchema } from "../Validation/authValidation.js";
import { ZodError } from "zod";
import { formatError, renderEmailEjs } from "../helper.js";
import prisma from "../config/database.js";
import bcrypt from 'bcrypt';
import { emailQueue, emailQueueName } from "../jobs/emailJobs.js";
import uuid4 from "uuid4";


const router = Router();

router.post("/register", async(req: Request, res: Response): Promise<any>=>{
    try {
        const body = req.body;
        const payload = registerSchema.parse(body);   
        let user = await prisma.user.findUnique({where:{
            email: payload.email
        }});

        if(user){
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
        const html= await renderEmailEjs("emailVerify", {name: payload.name, url: url});

        await emailQueue.add(emailQueueName, {to: payload.email, subject:"Clash Email Verification ", html:html});

        await prisma.user.create({
            data:{
                name: payload.name,
                email: payload.email,
                password: payload.password,
                emailVarifyToken: token
            }
        });
        
        return res.json({message:"Please check your email. We have sent you a verification link."});

    } catch (error) {
        if(error instanceof ZodError){
            const errors=formatError(error);
            return res.status(422).json({message:"Invalid Data", errors})
        }
        return res.status(500).json({message:"Internal Server Error"});
    }
});

export default router;