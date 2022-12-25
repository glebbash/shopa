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
import { ChangeGroupDialog } from "../components/ChangeGroupDialog";

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

  const [hideChecked, setHideChecked] = useLocalStorage(
    `${listId}/hideCompleted`,
    false,
    {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  );

  const data = useShoppingList(listId);
  const items = data?.items as Item[] | undefined;
  const suggestedGroups = [
    ...new Set((items ?? []).map((i) => i.group)),
  ].sort();

  const createItemDialog = CreateItemDialog.useOptions({
    suggestedGroups,
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
  const changeItemGroupDialog = ChangeGroupDialog.useOptions({
    description: `Change group ${selectedItem.group} of ${selectedItem.name}`,
    suggestedGroups,
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

  const itemViews = createItems(
    items,
    onItemAction,
    hiddenGroups,
    setHiddenGroups,
    hideChecked
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box display="flex" flexDirection="row" sx={{ m: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Lists
          </Link>
          <Typography color="text.primary">
            {data?.name ?? "loading..."}
          </Typography>
        </Breadcrumbs>
        <Box flexGrow="1"></Box>
        <PopupState variant="popover">
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
                    items?.map((item) =>
                      updateItem({ ...item, checked: true })
                    );
                    popupState.close();
                  }}
                >
                  Check all
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    items?.map((item) =>
                      updateItem({ ...item, checked: !item.checked })
                    );
                    popupState.close();
                  }}
                >
                  Invert checked
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setHideChecked(!hideChecked);
                    popupState.close();
                  }}
                >
                  {!hideChecked ? "Hide checked" : "Show checked"}
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      </Box>

      {itemViews}
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
      <ChangeGroupDialog {...changeItemGroupDialog} />
      <InputDialog {...deleteItemDialog} />
    </Box>
  );
}

function createItems(
  items: Item[] | undefined,
  onAction: OnItemAction,
  hiddenGroups: Set<string>,
  setHiddenGroups: (hiddenGroups: Set<string>) => void,
  hideCompleted: boolean
) {
  if (!Array.isArray(items)) {
    return "loading...";
  }

  if (hideCompleted) {
    items = items.filter((item) => !item.checked);
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
          items: _.sortBy(
            _.orderBy(_.sortBy(items, "name"), "assigned_to", "desc"),
            "checked"
          ),
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
        <PopupState variant="popover">
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
                  {item.assigned_to == null ? "Assign" : "Unassign"}
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
