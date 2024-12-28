import {z} from 'zod';

export const registerSchema = z.object({
    name: z.string({message:"Name is required"})
    .min(3,{message:"Name must be 3 character long."}),
    email:z.string({message:"Email is required"})
    .email({message:"Please enter a valid email."}),
    password:z.string({message:"Password is required."})
    .min(6,{message:"Password must contain 6 characters."}),
    confirm_password:z.string({message:"Confirm password is required"})
    .min(6,{message:"Confirm password must contain 6 characters."})
}).refine((data)=>data.password===data.confirm_password,{
    message:"Confirm password not matched",
    path: ["confirm_password"]
});