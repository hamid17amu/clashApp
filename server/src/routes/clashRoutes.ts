import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { formatError, imageValidator, removeImage, uploadFile } from "../helper.js";
import { clashSchema } from "../Validation/clashValidation.js";
import { UploadedFile } from "express-fileupload";
import prisma from "../config/database.js";
import authMiddleware from "../middleware/authmMiddleware.js";

const router = Router();

router.post("/",authMiddleware,async(req:Request, res:Response):Promise<any>=>{
    try {
        const body=req.body;
        const payload=clashSchema.parse(body);

        if(req.files?.image){
            const image = req.files?.image as UploadedFile;
            const validMsg= imageValidator(image.size, image.mimetype);
            if(validMsg){
                return res.status(422).json({
                    errors:{
                        image:validMsg
                    }
                });
            }

            payload.image=await uploadFile(image);
        }else{
            return res.status(422).json({errors:{
                image:"Image field is required"
            }});
        }

        await prisma.clash.create({
            data:{
                ...payload,
                image:payload.image,
                user_id:req.user?.id!,
                expire_at:new Date(payload.expire_at)
            }
        });

        return res.json({message:"Clash created successfully"});

    } catch (error) {
        if(error instanceof ZodError){
                    const errors=formatError(error);
                    return res.status(422).json({message:"Invalid Data", errors})
                }
                return res.status(500).json({message:"Internal Server Error"});
    }
});

router.get("/",async(req:Request, res:Response):Promise<any>=>{
    try {
        const clash = await prisma.clash.findMany({
            where:{
                user_id:req.user?.id
            }
        });


        return res.json({message:"clash fetched successfully", data:clash});

    } catch (error) {
        if(error instanceof ZodError){
                    const errors=formatError(error);
                    return res.status(422).json({message:"Invalid Data", errors})
                }
                return res.status(500).json({message:"Internal Server Error"});
    }
});

router.get("/:id",async(req:Request, res:Response):Promise<any>=>{
    try {
        const {id}=req.params;
        const clash = await prisma.clash.findUnique({
            where:{
                id:Number(id)
            }
        });


        return res.json({message:"clash fetched successfully", data:clash});

    } catch (error) {
        if(error instanceof ZodError){
                    const errors=formatError(error);
                    return res.status(422).json({message:"Invalid Data", errors})
                }
                return res.status(500).json({message:"Internal Server Error"});
    }
});

router.put("/:id",authMiddleware,async(req:Request, res:Response):Promise<any>=>{
    try {
        const {id}=req.params;
        const body=req.body;
        const payload = clashSchema.parse(body);
        
        
        if(req.files?.image){
            const image = req.files?.image as UploadedFile;
            const validMsg= imageValidator(image.size, image.mimetype);
            if(validMsg){ 
                return res.status(422).json({
                    errors:{
                        image:validMsg
                    }
                });
            }
            
            const clash = await prisma.clash.findUnique({
                select:{
                    image:true,
                    id:true
                },
                where:{
                    id:Number(id)
                }
            });
    
            if(clash?.image) removeImage(clash?.image!);
            payload.image = await uploadFile(image);
        }

        await prisma.clash.update({
            data:{
                ...payload,
                expire_at:new Date(payload.expire_at)
            },
            where:{
            id:Number(id)
        }});
        

        return res.json({message:"clash updated successfully!"});

    } catch (error) {
        if(error instanceof ZodError){
                    const errors=formatError(error);
                    return res.status(422).json({message:"Invalid Data", errors})
                }
                return res.status(500).json({message:"Internal Server Error"});
    }
});


router.delete("/:id",authMiddleware,async(req:Request, res:Response):Promise<any>=>{
    try {
        const {id}=req.params

        const clash = await prisma.clash.findUnique({
            select:{
                id:true,
                image:true
            },
            where:{
                id:Number(id)
            }
        });

        if(clash) removeImage(clash?.image);

        await prisma.clash.delete({
            where:{
                id:Number(id)
            }
        })

        return res.json({message:"clash deleted successfully!"});

    } catch (error) {
        if(error instanceof ZodError){
                    const errors=formatError(error);
                    return res.status(422).json({message:"Invalid Data", errors})
                }
                return res.status(500).json({message:"Internal Server Error"});
    }
});


export default router;