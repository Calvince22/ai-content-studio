import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const generateSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(5, "Prompt must contain at least 5 characters.")
    .max(4000, "Prompt must be shorter than 4000 characters."),
});

export const deletePromptSchema = z.object({
  promptId: z.string().uuid("Invalid prompt id."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
export type DeletePromptInput = z.infer<typeof deletePromptSchema>;
