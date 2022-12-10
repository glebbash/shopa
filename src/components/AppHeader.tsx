import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { InputDialog } from "./InputDialog";
import { importShoppingList } from "../lib/api";

export function AppHeader() {
  const session = useSession()!;

  const importListDialog = InputDialog.useOptions({
    title: "Import list",
    description: (
      <>
        Import a shopping list using a JSON array with items following this
        schema:
        <br />
        <pre>
          {"{"}name: string, group: string, checked: boolean{"}"}
        </pre>
      </>
    ),
    inputs: ["List name", "JSON data"],
    action: "Import",
    onConfirm: async ([listName, listData]) => {
      try {
        const listItems = JSON.parse(listData);
        await importShoppingList(session.user.id, listName, listItems);
        window.location.href = "/";
      } catch (e) {
        console.error(e);
        alert("Invalid data format");
      }
    },
  });

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
            <PopupState variant="popover" popupId="demo-popup-menu">
              {(popupState) => (
                <>
                  <Tooltip title={session?.user?.email}>
                    <IconButton sx={{ p: 0 }} {...bindTrigger(popupState)}>
                      <Avatar src={session?.user?.user_metadata.picture} />
                    </IconButton>
                  </Tooltip>

                  <Menu {...bindMenu(popupState)}>
                    <MenuItem
                      onClick={async () => {
                        popupState.close();
                        importListDialog.setOpen(true);
                      }}
                    >
                      Import list
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        popupState.close();
                        await supabase.auth.signOut();
                        window.location.href = "/";
                      }}
                    >
                      Log out
                    </MenuItem>
                  </Menu>
                </>
              )}
            </PopupState>
          </Box>
        </Toolbar>
      </Container>
      <InputDialog {...importListDialog} />
    </AppBar>
  );
}
