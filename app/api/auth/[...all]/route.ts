import { auth } from "@/lib/auth"; 
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
/* This file sets up the authentication routes for the Next.js 
 application using Better Auth's Next.js handler.
 */