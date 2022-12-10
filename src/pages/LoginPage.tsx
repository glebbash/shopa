import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { supabase } from "../lib/supabase";

export function LoginPage() {
  const handleLogin = async () => {
    await supabase.signIn();
  };

  return (
    <Box
      sx={{
        p: 4,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Avatar src="/shopa.png" sx={{ width: 128, height: 128 }} />
      <Typography variant="h1">Shopa</Typography>
      <Button sx={{ m: 4 }} variant="contained" onClick={handleLogin}>
        Log in
      </Button>
    </Box>
  );
}
