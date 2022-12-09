import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ListSubheader from "@mui/material/ListSubheader";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLoaderData } from "react-router-dom";
import useSWR from "swr";
import _ from "lodash";

import {
  createShoppingItem,
  loadShoppingList,
  setItemChecked,
} from "../lib/api";

type Item = {
  id: string;
  created_at: string;
  name: string;
  group: string;
  checked: boolean;
  list_id: string;
};

export function ShoppingListPage() {
  const listId = useLoaderData() as string;
  const [dataRefreshId, setDataRefreshId] = useState(crypto.randomUUID());

  const handleToggle = async (item: { id: string; checked: boolean }) => {
    await setItemChecked(item.id, !item.checked);
    setDataRefreshId(crypto.randomUUID());
  };

  const { data, error } = useSWR(`${dataRefreshId}/lists/${listId}`, () =>
    loadShoppingList(listId)
  );
  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  const dialogOptions = useCreateItemDialogOptions({
    onConfirm: async (itemName, groupName) => {
      await createShoppingItem(listId, itemName, groupName);
      setDataRefreshId(crypto.randomUUID());
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ m: 2 }}>
        <Link underline="hover" color="inherit" href="/">
          Lists
        </Link>
        <Typography color="text.primary">
          {data?.name ?? "loading..."}
        </Typography>
      </Breadcrumbs>
      {createItems(data?.items as never, handleToggle)}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={() => dialogOptions.setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <CreateItemDialog {...dialogOptions} />
    </Box>
  );
}

function createItems(items: Item[] | undefined, handleToggle: any) {
  if (!Array.isArray(items)) {
    return "loading...";
  }

  const listItems = Object.entries(
    _.groupBy(_.sortBy(items, "group"), "group")
  ).map(([groupName, items]) => {
    return (
      <ItemGroup
        {...{ groupName, items: _.sortBy(items, "checked"), handleToggle }}
      />
    );
  });

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        flexGrow: 1,
        overflow: "auto",
        pt: 0,
      }}
    >
      {listItems}
    </List>
  );
}

type ItemGroupProps = {
  items: Item[];
  groupName: string;
  handleToggle: any;
};

function ItemGroup({ items, groupName, handleToggle }: ItemGroupProps) {
  const [open, setOpen] = useState(true);

  const actualItems = items.map((item) => {
    const labelId = `checkbox-list-label-${item.id}`;

    return (
      <ListItem
        key={item.id}
        secondaryAction={
          <IconButton edge="end" aria-label="comments">
            <MoreVertIcon />
          </IconButton>
        }
        disablePadding
      >
        <ListItemButton
          role={undefined}
          onClick={() => handleToggle(item)}
          dense
        >
          <ListItemIcon>
            <Checkbox
              color="default"
              edge="start"
              checked={item.checked}
              tabIndex={-1}
              disableRipple
              inputProps={{ "aria-labelledby": labelId }}
            />
          </ListItemIcon>
          <ListItemText
            id={labelId}
            primary={item.name}
            sx={{
              textDecoration: item.checked ? "line-through" : "default",
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  });

  return (
    <Box key={groupName}>
      <ListSubheader>
        <ListItem
          disablePadding
          secondaryAction={
            open ? (
              <IconButton edge="end" aria-label="comments">
                <MoreVertIcon />
              </IconButton>
            ) : (
              <IconButton
                edge="end"
                aria-label="comments"
                disableRipple
                sx={{ pointerEvents: "none" }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )
          }
        >
          <ListItemButton onClick={() => setOpen(!open)} role={undefined} dense>
            <ListItemText primary={groupName} />
          </ListItemButton>
        </ListItem>
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {actualItems}
      </Collapse>
    </Box>
  );
}

function useCreateItemDialogOptions({
  onConfirm = async (itemName: string, groupName: string) => {},
} = {}) {
  const [open, setOpen] = useState(false);

  return { open, setOpen, onConfirm };
}

function CreateItemDialog({
  open,
  setOpen,
  onConfirm,
}: ReturnType<typeof useCreateItemDialogOptions>) {
  const [itemName, setItemName] = useState("");
  const [groupName, setGroupName] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create</DialogTitle>
      <DialogContent>
        <DialogContentText>Add a new item.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          fullWidth
          variant="standard"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="group"
          label="Group"
          fullWidth
          variant="standard"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            onConfirm(itemName, groupName);
            handleClose();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
