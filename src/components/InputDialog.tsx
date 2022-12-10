import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export { component as InputDialog };
const component = Object.assign(InputDialog, {
  useOptions,
});

function useOptions({
  title = "Title",
  description = "Description",
  inputs = [] as string[],
  action = "Confirm",
  onConfirm = async (values: string[]) => {},
}) {
  const [open, setOpen] = useState(false);

  return {
    title,
    description,
    inputs,
    action,
    open,
    setOpen,
    onConfirm,
  };
}

function InputDialog(props: ReturnType<typeof useOptions>) {
  const valueStates = Array.from({ length: props.inputs.length }, () => {
    return useState("");
  });

  const handleClose = () => {
    props.setOpen(false);
    for (const [, setValue] of valueStates) {
      setValue("");
    }
  };

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
        {valueStates.map(([value, setValue], i) => (
          <TextField
            key={props.inputs[i]}
            autoFocus
            margin="dense"
            label={props.inputs[i]}
            fullWidth
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            props.onConfirm(valueStates.map(([value]) => value));
            handleClose();
          }}
        >
          {props.action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
