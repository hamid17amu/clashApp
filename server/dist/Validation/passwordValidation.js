import { z } from "zod";
export const forgotPasswordSchema = z.object({
    email: z.string({ message: "Email is required" })
        .email({ message: "Please enter a valid email." })
});
export const resetPasswordSchema = z.object({
    email: z.string({ message: "Email is required" })
        .email({ message: "Please enter a valid email." }),
    token: z.string({ message: "Invalid link." }),
    password: z.string({ message: "Password is required." })
        .min(6, { message: "Password must contain 6 characters." }),
    confirm_password: z.string({ message: "Confirm password is required" })
        .min(6, { message: "Confirm password must contain 6 characters." })
}).refine((data) => data.password === data.confirm_password, {
    message: "Confirm password not matched",
    path: ["confirm_password"]
});
