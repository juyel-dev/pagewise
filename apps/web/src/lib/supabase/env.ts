import { env } from "@/lib/env";

export const supabaseUrl = env.supabaseUrl;
export const supabaseKey = env.supabaseKey;
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);
