import "dotenv/config";
import { z } from "zod";


const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default("8000"),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(12),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

});

const parsed = EnvSchema.safeParse(process.env);

if(!parsed.success) {
   console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;