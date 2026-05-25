import { z } from "zod";

export function parseBody<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(message);
  }

  return result.data;
}
