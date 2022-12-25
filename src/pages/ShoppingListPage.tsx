import { useEffect, useState } from "react";
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
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useLoaderData } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import _ from "lodash";

import { createShoppingItem, deleteItem, Item, updateItem } from "../lib/api";
import { InputDialog } from "../components/InputDialog";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useShoppingList } from "../hooks/useShoppingList";
import { CreateItemDialog } from "../components/CreateItemDialog";
import { useSession } from "../hooks/useSession";

type OnItemAction = (
  item: Item,
  action: "assign" | "check" | "rename" | "change-group" | "delete"
) => void;

export function ShoppingListPage() {
  const { user } = useSession();
  const listId = useLoaderData() as string;

  const [hiddenGroups, setHiddenGroups] = useLocalStorage(
    `${listId}/checkedItems`,
    new Set<string>(),
    {
      serialize: (s) => JSON.stringify([...s]),
      deserialize: (s) => new Set(JSON.parse(s)),
    }
  );

  const data = useShoppingList(listId);
  const items = data?.items as Item[] | undefined;

  const createItemDialog = CreateItemDialog.useOptions({
    suggestedGroups: [...new Set((items ?? []).map((i) => i.group))],
    onConfirm: async ([itemName, groupName]) => {
      await createShoppingItem(listId, itemName, groupName, false);
    },
  });

  const [selectedItem, setSelectedItem] = useState({
    name: "",
  } as unknown as Item);

  const renameItemDialog = InputDialog.useOptions({
    title: "Rename item",
    description: `Rename ${selectedItem.name}`,
    inputs: ["New name"],
    action: "Rename",
    onConfirm: async ([itemName]) => {
      await updateItem({ ...selectedItem, name: itemName });
    },
  });
  const changeItemGroupDialog = InputDialog.useOptions({
    title: "Change group",
    description: `Change group ${selectedItem.group} of ${selectedItem.name}`,
    inputs: ["New group"],
    action: "Change",
    onConfirm: async ([groupName]) => {
      await updateItem({ ...selectedItem, group: groupName });
    },
  });
  const deleteItemDialog = InputDialog.useOptions({
    title: "Delete item",
    description: `Delete "${selectedItem.name}"`,
    inputs: [],
    action: "Delete",
    onConfirm: async () => {
      await deleteItem(selectedItem.id);
    },
  });

  const onItemAction: OnItemAction = async (item, action) => {
    if (action === "check") {
      await updateItem({ ...item, checked: !item.checked });
      return;
    }

    if (action === "assign") {
      await updateItem({
        ...item,
        assigned_to:
          item.assigned_to == null ? user.user_metadata.picture : null,
      });
      return;
    }

    setSelectedItem(item);
    if (action === "rename") renameItemDialog.setOpen(true);
    if (action === "change-group") changeItemGroupDialog.setOpen(true);
    if (action === "delete") deleteItemDialog.setOpen(true);
  };

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
      {createItems(items, onItemAction, hiddenGroups, setHiddenGroups)}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={() => createItemDialog.setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <CreateItemDialog {...createItemDialog} />
      <InputDialog {...renameItemDialog} />
      <InputDialog {...changeItemGroupDialog} />
      <InputDialog {...deleteItemDialog} />
    </Box>
  );
}

function createItems(
  items: Item[] | undefined,
  onAction: OnItemAction,
  hiddenGroups: Set<string>,
  setHiddenGroups: (hiddenGroups: Set<string>) => void
) {
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
        {...{
          hiddenGroups,
          setHiddenGroups,
          groupName,
          items: _.sortBy(_.sortBy(items, "name"), "checked"),
          onAction,
        }}
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
  hiddenGroups: Set<string>;
  setHiddenGroups: (hiddenGroups: Set<string>) => void;
  items: Item[];
  groupName: string;
  onAction: OnItemAction;
};

function ItemGroup({
  hiddenGroups,
  setHiddenGroups,
  items,
  groupName,
  onAction,
}: ItemGroupProps) {
  const [open, setOpen_] = useState(!hiddenGroups.has(groupName));

  const setOpen = (open: boolean) => {
    setOpen_(open);
    if (!open) {
      hiddenGroups.add(groupName);
    } else {
      hiddenGroups.delete(groupName);
    }
    setHiddenGroups(hiddenGroups);
  };

  const childItems = items.map((item) => (
    <ItemView key={item.id} item={item} onAction={onAction} />
  ));

  return (
    <Box>
      <ListSubheader>
        <ListItemButton onClick={() => setOpen(!open)} role={undefined} dense>
          <ListItemText primary={groupName} />
          {items.filter((i) => i.checked).length}/{items.length}
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {childItems}
      </Collapse>
    </Box>
  );
}

type ItemProps = {
  item: Item;
  onAction: OnItemAction;
};

function ItemView({ item, onAction }: ItemProps) {
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
                <MenuItem
                  onClick={() => {
                    onAction(item, "assign");
                    popupState.close();
                  }}
                >
                  Assign
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onAction(item, "rename");
                    popupState.close();
                  }}
                >
                  Rename
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onAction(item, "change-group");
                    popupState.close();
                  }}
                >
                  Change group
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onAction(item, "delete");
                    popupState.close();
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      }
      disablePadding
    >
      <ListItemButton
        role={undefined}
        onClick={() => onAction(item, "check")}
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
        {item.assigned_to && (
          <ListItemIcon>
            <Avatar src={item.assigned_to} />
          </ListItemIcon>
        )}
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
