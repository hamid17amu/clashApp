import {Router, Request, Response} from 'express';
import prisma from '../config/database.js';
import { authRateLimiter } from '../config/rateLimiter.js';
import { ZodError } from 'zod';
import { checkHoursDiff, formatError, renderEmailEjs } from '../helper.js';
import { forgotPasswordSchema, resetPasswordSchema } from '../Validation/passwordValidation.js';
import bcrypt from 'bcrypt';
import uuid4 from 'uuid4';
import { emailQueue, emailQueueName } from '../jobs/emailJobs.js';

const router = Router();

router.post("/forgot-password", authRateLimiter, async(req:Request, res:Response):Promise<any>=>{
    try {
        const body=req.body;
        const payload = forgotPasswordSchema.parse(body);

        let user = await prisma.user.findUnique({where:{
            email:payload.email
        }});

        if(!user ||user===undefined){
            return res.status(422).json({errors:{
                email:"Email not found."
            }});
        }
        
        const salt = await bcrypt.genSalt(12);
        const token = await bcrypt.hash(uuid4(), salt);

        await prisma.user.update({
            data:{
                passWordResetToken: token,
                TokenSendAt: new Date().toISOString()
            },
            where:{
                email:payload.email
            }
        });

        const url = `${process.env.CLIENT_URL}/reset-password?email=${payload.email}&token=${token}`;
        const html= await renderEmailEjs("forgotPassword", {name: user.name, url: url});
        await emailQueue.add(emailQueueName, {to: payload.email, subject:"Reset your password", html:html});

        return res.json({message:"The password reset link has been sent to your email."});

    } catch (error) {
        if(error instanceof ZodError){
            const errors=formatError(error);
            return res.status(422).json({message:"Invalid Data", errors})
        }
        return res.status(500).json({message:"Internal Server Error"});
    }
});

router.post("/reset-password", async(req:Request, res:Response):Promise<any>=>{
    try {
        const body = req.body;
        const payload = resetPasswordSchema.parse(body);

        let user = await prisma.user.findUnique({
            where:{
                email:payload.email
            }
        });

        if(!user || user===null || user===undefined){
            return res.status(422).json({
                message: "Invalid link. Make sure you copied the URL correctly",
                errors:{
                    email:"Invalid link. Make sure you copied the URL correctly"
                }
            });
        }

        if(user.passWordResetToken===null){
            return res.status(422).json({
                message: "Password reset link expired"
            });
        }
        
        if(payload.token!==user.passWordResetToken){
            return res.status(422).json({
                message: "Invalid link. Make sure you copied the URL correctly",
                errors:{
                    email:"Invalid link. Make sure you copied the URL correctly"
                }
            });
        }
        
        const hourDiff=checkHoursDiff(user.TokenSendAt!);

        if(Number(hourDiff)>2){
            return res.status(422).json({
                message: "Password reset link expired"
            });
        }
        
        const salt=await bcrypt.genSalt(12);
        const newPass = await bcrypt.hash(payload.password,salt);

        await prisma.user.update({
            data:{
                password:newPass,
                passWordResetToken:null,
            },
            where:{
                email:payload.email
            }
        });

        return res.status(200).json({
            message:"Password reset successfully."
        });

    } catch (error) {
        if(error instanceof ZodError){
            const errors=formatError(error);
            return res.status(422).json({message:"Invalid Data", errors})
        }
        return res.status(500).json({message:"Internal Server Error"});
    }
});

export default router;