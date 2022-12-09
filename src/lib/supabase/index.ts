import { createClient } from "@supabase/supabase-js";
import { Database } from "./database";

export const supabase = Object.assign(
  createClient<Database>(
    "https://wfleacgjtncotluxoqyw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbGVhY2dqdG5jb3RsdXhvcXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA1ODQzMTUsImV4cCI6MTk4NjE2MDMxNX0.NABEuf-mPDxFuBuAitkVTBD18oO_rzl_821sl1IUuis"
  ),
  { signIn }
);

async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) throw error;
}
