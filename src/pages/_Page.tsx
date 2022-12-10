import Box from "@mui/material/Box";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { AppHeader } from "../components/AppHeader";
import { SessionContext } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { LoginPage } from "./LoginPage";

export function _Page() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      const urlBeforeLogin = localStorage.getItem("urlBeforeLogin");
      if (urlBeforeLogin) {
        localStorage.removeItem("urlBeforeLogin");
        location.href = urlBeforeLogin;
      }
    });

    return data.subscription.unsubscribe;
  }, []);

  if (!session) return <LoginPage />;

  return (
    <SessionContext.Provider value={session}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <AppHeader />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </SessionContext.Provider>
  );
}
