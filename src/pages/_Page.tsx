import Box from "@mui/material/Box";
import { Outlet } from "react-router";
import { AppHeader } from "../components/AppBar";
import { useSession } from "../hooks/useSession";
import { LoginPage } from "./LoginPage";

export function _Page() {
  const session = useSession();

  if (!session) return <LoginPage />;

  return (
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
  );
}
