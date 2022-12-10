import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export const SessionContext = createContext<Session>(0 as never);

export function useSession() {
  return useContext(SessionContext);
}
