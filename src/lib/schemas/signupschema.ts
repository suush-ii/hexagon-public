import { z } from "zod";

export const formSchema = z.object({
    username: z.string({required_error: "Username required."}).min(3, {message: "Username must be at least 3 characters!"}).max(20, {message: "Username can't be over 20 characters!"}),
    password: z.string({required_error: "Password required."}).min(1).max(100),
    key: z.string({required_error: "Key required."}).min(1).max(100),
    gender: z.enum(["male", "female", "nonbinary"]).default("nonbinary")
});

export type FormSchema = typeof formSchema;