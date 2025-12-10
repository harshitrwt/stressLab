import { z } from "zod";

const urlSchema = z.string().url();

export function validateURL(input: string) {
  try {
    urlSchema.parse(input);
    return { success: true };
  } catch {
    return { success: false };
  }
}
