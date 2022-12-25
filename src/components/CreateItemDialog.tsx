import { useState, ReactNode } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";

export { component as CreateItemDialog };
const component = Object.assign(CreateItemDialog, { useOptions });

function useOptions({
  title = "Create item",
  description = "Add a new item." as ReactNode,
  action = "Create",
  suggestedGroups = [] as string[],
  onConfirm = async (values: [name: string, group: string]) => {},
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

function CreateItemDialog(props: ReturnType<typeof useOptions>) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");

  const handleClose = () => {
    props.setOpen(false);
    setName("");
  };

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Autocomplete
          value={group}
          onChange={(_, group) => setGroup(group ?? "")}
          // disablePortal
          options={props.suggestedGroups}
          sx={{ mt: 2, width: 300 }}
          renderInput={(params) => (
            <TextField {...params} variant="standard" label="Group" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            props.onConfirm([name, group]);
            handleClose();
          }}
        >
          {props.action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
