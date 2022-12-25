import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// @ts-ignore
export function AutocompleteInput({ value, onChange, suggestions, label }) {
  return (
    <Autocomplete
      value={value}
      onInputChange={(_, value) => onChange(value ?? "")}
      options={[...suggestions, value]}
      sx={{ mt: 2 }}
      renderInput={(params) => (
        <TextField {...params} variant="standard" label={label} />
      )}
    />
  );
}
