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
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import useSWR from "swr";

import { useSession } from "../hooks/useSession";
import { createShoppingList, loadUserShoppingLists } from "../lib/api";

export function MyListsPage() {
  const session = useSession()!;
  const userId = session?.user?.id;

  const [refreshId, setRefreshId] = useState(crypto.randomUUID());
  const dialogOptions = useCreateListDialogOptions({
    onConfirm: async (listName: string) => {
      await createShoppingList(userId, listName);
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
        {data?.map((l) => (
          <ListItem
            key={l.id}
            disablePadding
            secondaryAction={
              <PopupState variant="popover" popupId="demo-popup-menu">
                {(popupState) => (
                  <>
                    <IconButton
                      edge="end"
                      aria-label="more"
                      {...bindTrigger(popupState)}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu {...bindMenu(popupState)}>
                      <MenuItem onClick={popupState.close}>Edit</MenuItem>
                      <MenuItem onClick={popupState.close}>Delete</MenuItem>
                    </Menu>
                  </>
                )}
              </PopupState>
            }
          >
            <ListItemButton href={`/lists/${l.id}`}>
              <ListItemIcon>
                <FactCheckIcon />
              </ListItemIcon>
              <ListItemText primary={l.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={() => dialogOptions.setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <CreateListDialog {...dialogOptions} />
    </Box>
  );
}

function useCreateListDialogOptions({
  onConfirm = async (listName: string) => {},
} = {}) {
  const [open, setOpen] = useState(false);

  return { open, setOpen, onConfirm };
}

// @ts-ignore
function CreateListDialog({ open, setOpen, onConfirm }) {
  const [value, setValue] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create</DialogTitle>
      <DialogContent>
        <DialogContentText>Add a new shopping list.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          fullWidth
          variant="standard"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            onConfirm(value);
            handleClose();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
