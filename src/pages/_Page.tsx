import Box from "@mui/material/Box";
import { Outlet } from "react-router";
import { AppHeader } from "../components/AppBar";

export function _Page() {
  return (
    <>
      <AppHeader />
      <Box>
        <Outlet />
      </Box>
    </>
  );
}
