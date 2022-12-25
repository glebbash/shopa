import { useState, ReactNode } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AutocompleteInput } from "./AutocompleteInput";

export { component as ChangeGroupDialog };
const component = Object.assign(ChangeGroupDialog, { useOptions });

function useOptions({
  title = "Change group",
  description = "" as ReactNode,
  action = "Change",
  suggestedGroups = [] as string[],
  onConfirm = async (values: [group: string]) => {},
}) {
  const [open, setOpen] = useState(false);

  return {
    title,
    description,
    action,
    suggestedGroups,
    open,
    setOpen,
    onConfirm,
  };
}

function ChangeGroupDialog(props: ReturnType<typeof useOptions>) {
  const [group, setGroup] = useState("");

  const handleClose = () => {
    props.setOpen(false);
    setGroup("");
  };

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
        <AutocompleteInput
          value={group}
          onChange={setGroup}
          label="Group"
          suggestions={props.suggestedGroups}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            props.onConfirm([group]);
            handleClose();
          }}
        >
          {props.action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
