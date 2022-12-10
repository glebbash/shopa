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
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useLoaderData } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import useSWR from "swr";
import _ from "lodash";

import {
  createShoppingItem,
  loadShoppingList,
  setItemChecked,
} from "../lib/api";
import { InputDialog } from "../components/InputDialog";

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

  const [selectedItem, setSelectedItem] = useState({
    id: "",
    name: "",
    group: "",
  });

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

  const createItemDialog = InputDialog.useOptions({
    title: "Create item",
    description: "Add a new item.",
    inputs: ["Name", "Group"],
    action: "Create",
    onConfirm: async ([itemName, groupName]) => {
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
        onClick={() => createItemDialog.setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <InputDialog {...createItemDialog} />
    </Box>
  );
}

function createItems(items: Item[] | undefined, handleToggle: any) {
  if (!Array.isArray(items)) {
    return "loading...";
  }

  const sortedAndGrouped = Object.entries(
    _.groupBy(_.sortBy(items, "group"), "group")
  );

  const listItems = sortedAndGrouped.map(([groupName, items]) => {
    return (
      <ItemGroup
        key={groupName}
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

  const childItems = items.map((item) => (
    <Item key={item.id} item={item} handleToggle={handleToggle} />
  ));

  return (
    <Box>
      <ListSubheader>
        {/* TODO: remove ListItem and style expand icon manually */}
        <ListItem
          disablePadding
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="comments"
              disableRipple
              sx={{ pointerEvents: "none" }}
            >
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
        >
          <ListItemButton onClick={() => setOpen(!open)} role={undefined} dense>
            <ListItemText primary={groupName} />
          </ListItemButton>
        </ListItem>
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {childItems}
      </Collapse>
    </Box>
  );
}

function Item({
  item,
  handleToggle,
}: {
  item: Item;
  handleToggle: (item: Item) => void;
}) {
  const labelId = `checkbox-list-label-${item.id}`;

  return (
    <ListItem
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
      disablePadding
    >
      <ListItemButton role={undefined} onClick={() => handleToggle(item)} dense>
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
}
