import { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
import { useLoaderData } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
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

const StyledFab = styled(Fab)({
  position: "absolute",
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: "0 auto",
});

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
    `${listId}/hideChecked`,
    false
  );

  const [showAssigned, setShowAssigned] = useLocalStorage(
    `${listId}/showAssigned`,
    false
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

  let filteredItems = items;
  if (filteredItems) {
    if (hideChecked) {
      filteredItems = filteredItems.filter((item) => !item.checked);
    }

    if (showAssigned) {
      filteredItems = filteredItems.filter(
        (item) => item.assigned_to == user.user_metadata.picture
      );
    }
  }

  const itemViews = createItems(
    filteredItems,
    onItemAction,
    hiddenGroups,
    setHiddenGroups
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          pb: "50px",
        }}
      >
        {itemViews}
      </Box>

      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar>
          <Typography color="inherit">{data?.name ?? "loading..."}</Typography>
          <StyledFab
            color="secondary"
            aria-label="add"
            onClick={() => createItemDialog.setOpen(true)}
          >
            <AddIcon />
          </StyledFab>
          <Box sx={{ flexGrow: 1 }} />
          <PopupState variant="popover">
            {(popupState) => (
              <>
                <IconButton
                  color="inherit"
                  edge="end"
                  aria-label="more"
                  {...bindTrigger(popupState)}
                >
                  <MoreVertIcon />
                </IconButton>

                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={() => {
                      setShowAssigned(!showAssigned);
                      popupState.close();
                    }}
                  >
                    {!showAssigned ? "Show assigned" : "Show all"}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setHideChecked(!hideChecked);
                      popupState.close();
                    }}
                  >
                    {!hideChecked ? "Hide checked" : "Show checked"}
                  </MenuItem>
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
                      if (items) {
                        const itemsToExport = items.map((item) => ({
                          name: item.name,
                          group: item.group,
                          checked: item.checked,
                        }));

                        const a = document.createElement("a");
                        const file = new Blob([JSON.stringify(itemsToExport)], {
                          type: "application/json",
                        });
                        a.href = URL.createObjectURL(file);
                        a.download = listId + ".json";
                        a.click();
                      }
                      popupState.close();
                    }}
                  >
                    Export
                  </MenuItem>
                </Menu>
              </>
            )}
          </PopupState>
        </Toolbar>
        <CreateItemDialog {...createItemDialog} />
        <InputDialog {...renameItemDialog} />
        <ChangeGroupDialog {...changeItemGroupDialog} />
        <InputDialog {...deleteItemDialog} />
      </AppBar>
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
    const sortedItems = _.sortBy(
      _.orderBy(_.sortBy(items, "name"), "assigned_to", "desc"),
      "checked"
    );
    return (
      <ItemGroup
        key={groupName}
        {...{
          hiddenGroups,
          setHiddenGroups,
          groupName,
          items: sortedItems,
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

const StyledListSubHeader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

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
      <StyledListSubHeader disableGutters>
        <ListItemButton onClick={() => setOpen(!open)} role={undefined} dense>
          <ListItemIcon>
            {open ? <ArrowDropDown /> : <ArrowRight />}
          </ListItemIcon>
          <ListItemText
            primary={groupName}
            primaryTypographyProps={{ variant: "body1" }}
          />
          {items.filter((i) => i.checked).length}/{items.length}
        </ListItemButton>
      </StyledListSubHeader>
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
  const morePopup = (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <IconButton edge="end" aria-label="more" {...bindTrigger(popupState)}>
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
  );

  return (
    <ListItem secondaryAction={morePopup} disablePadding>
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
            sx={{ pl: 1.5 }}
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
          primaryTypographyProps={{ variant: "body1" }}
          sx={{
            textDecoration: item.checked ? "line-through" : "default",
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
