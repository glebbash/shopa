import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const result = await supabase.auth.getSession();
      setSession(result.data.session);
    })();
  });

  return session;
}
