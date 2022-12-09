import { useState, MouseEvent } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";

export function AppHeader() {
  const session = useSession();
  const { menuAnchor, setMenuAnchor, clearMenuAnchor } = useMenuAnchor();

  return (
    <AppBar position="static" sx={{ display: "flex", flexDirection: "column" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Avatar
            src="/shopa-icon.png"
            sx={{
              mr: 2,
            }}
          />

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: "flex",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Shopa
          </Typography>

          <Box
            id="spacer"
            sx={{
              display: "flex",
              flexGrow: 1,
            }}
          ></Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={session?.user?.email}>
              <IconButton onClick={setMenuAnchor} sx={{ p: 0 }}>
                <Avatar src={session?.user?.user_metadata.picture} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={menuAnchor}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(menuAnchor)}
              onClose={clearMenuAnchor}
            >
              <MenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                <Typography textAlign="center">Log out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function useMenuAnchor() {
  const [menuAnchor, setAnchorElUser] = useState<null | HTMLElement>(null);

  const setMenuAnchor = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const clearMenuAnchor = () => {
    setAnchorElUser(null);
  };

  return {
    menuAnchor,
    setMenuAnchor,
    clearMenuAnchor,
  };
}
