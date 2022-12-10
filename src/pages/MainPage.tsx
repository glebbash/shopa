import { useState } from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import useSWR from "swr";

import { useSession } from "../hooks/useSession";
import { InputDialog } from "../components/InputDialog";
import {
  createShoppingList,
  deleteShoppingList,
  loadUserShoppingLists,
  renameShoppingList,
} from "../lib/api";
import _ from "lodash";

export function MyListsPage() {
  const session = useSession()!;
  const userId = session?.user?.id;

  const [selectedList, setSelectedList] = useState({ id: "", name: "" });

  const [refreshId, setRefreshId] = useState(crypto.randomUUID());
  const createDialog = InputDialog.useOptions({
    title: "Create list",
    description: "Add a new shopping list.",
    inputs: ["Name"],
    action: "Create",
    onConfirm: async ([listName]) => {
      await createShoppingList(userId, listName);
      setRefreshId(crypto.randomUUID());
    },
  });
  const renameDialog = InputDialog.useOptions({
    title: "Rename list",
    description: `Rename "${selectedList.name}"`,
    inputs: ["New name"],
    action: "Rename",
    onConfirm: async ([listName]) => {
      await renameShoppingList(selectedList.id, listName);
      setRefreshId(crypto.randomUUID());
    },
  });
  const deleteDialog = InputDialog.useOptions({
    title: "Delete list",
    description: `Delete "${selectedList.name}"`,
    action: "Delete",
    onConfirm: async () => {
      await deleteShoppingList(selectedList.id);
      setRefreshId(crypto.randomUUID());
    },
  });

  const { data, error } = useSWR(`${userId}/${refreshId}/lists`, () =>
    loadUserShoppingLists(userId)
  );
  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }
  if (data === undefined) {
    return <div>Loading...</div>;
  }

  const lists = _.sortBy(data, "name");

  return (
    <Box
      key={refreshId}
      sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ m: 2, mb: 0 }}>
        <Link underline="hover" color="inherit" href="/">
          Lists
        </Link>
      </Breadcrumbs>
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {lists.map((list) => (
          <ListItem
            key={list.id}
            disablePadding
            secondaryAction={
              <PopupState variant="popover" popupId="demo-popup-menu">
                {(popup) => (
                  <>
                    <IconButton
                      edge="end"
                      aria-label="more"
                      {...bindTrigger(popup)}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu {...bindMenu(popup)}>
                      <MenuItem
                        onClick={() => {
                          setSelectedList(list);
                          popup.close();
                          renameDialog.setOpen(true);
                        }}
                      >
                        Rename
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSelectedList(list);
                          popup.close();
                          deleteDialog.setOpen(true);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </PopupState>
            }
          >
            <ListItemButton href={`/lists/${list.id}`}>
              <ListItemIcon>
                <FactCheckIcon />
              </ListItemIcon>
              <ListItemText primary={list.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={() => createDialog.setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <InputDialog {...createDialog} />
      <InputDialog {...renameDialog} />
      <InputDialog {...deleteDialog} />
    </Box>
  );
}
